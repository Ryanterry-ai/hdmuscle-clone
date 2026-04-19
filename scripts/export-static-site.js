import path from "path";

import * as cheerio from "cheerio";
import fs from "fs-extra";

import { normalizeAssetUrl, normalizeUrl } from "../crawler/url-utils.js";
import {
  ARTIFACTS,
  ROOT_PUBLIC_DIR,
  STATIC_PUBLIC_DIR,
  ensureBaseOutputStructure,
  logStep,
  readJson,
  writeJson
} from "./pipeline-utils.js";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function isSpecialProtocol(value = "") {
  return /^(mailto:|tel:|javascript:|data:|#)/i.test(value);
}

function safeUrl(url, base) {
  try { return new URL(url, base); } catch { return null; }
}

function normalizePathname(pathname = "/") {
  let next = (pathname || "/").replace(/\/+/g, "/");
  if (!next.startsWith("/")) next = `/${next}`;
  if (next !== "/" && next.endsWith("/")) next = next.slice(0, -1);
  return next || "/";
}

function toPageOutputPath(pageUrl) {
  const parsed = new URL(pageUrl);
  const pathname = normalizePathname(parsed.pathname);
  if (pathname === "/") return path.join(STATIC_PUBLIC_DIR, "index.html");
  return path.join(STATIC_PUBLIC_DIR, pathname.replace(/^\/+/, ""), "index.html");
}

function toRoutePath(pageUrl) {
  const pathname = normalizePathname(new URL(pageUrl).pathname);
  return pathname === "/" ? "/" : `${pathname}/`;
}

function relativeAssetPath(fromPageFile, localRelativePath) {
  const assetTarget = path.join(STATIC_PUBLIC_DIR, "assets", localRelativePath);
  const rel = path.relative(path.dirname(fromPageFile), assetTarget).replace(/\\/g, "/");
  return rel || "index.html";
}

function relativePagePath(fromPageUrl, toPageUrl) {
  const rel = path.relative(
    path.dirname(toPageOutputPath(fromPageUrl)),
    toPageOutputPath(toPageUrl)
  ).replace(/\\/g, "/");
  return rel || "index.html";
}

function appendSearchAndHash(relativePath, rawValue, baseUrl) {
  const parsed = safeUrl(rawValue, baseUrl);
  if (!parsed) return relativePath;
  let next = relativePath;
  if (parsed.search) next += parsed.search;
  if (parsed.hash) next += parsed.hash;
  return next;
}

/**
 * CORE FIX: Convert same-origin URLs to root-relative paths.
 * Old code returned full https://source-domain.com/path for same-site URLs —
 * that leaked the source domain into every page.
 */
function toPortableHref(candidate, pageUrl) {
  if (!candidate) return candidate;
  const resolved = safeUrl(candidate, pageUrl);
  const base = safeUrl(pageUrl, pageUrl);
  if (!resolved || !base) return candidate;
  if (resolved.origin === base.origin) {
    return resolved.pathname + resolved.search + resolved.hash;
  }
  return candidate; // External: keep absolute
}

// ---------------------------------------------------------------------------
// CSS / srcset rewriters
// ---------------------------------------------------------------------------

function replaceCssUrls(cssText, sourceUrl, assetLookup, pageFile) {
  return cssText.replace(/url\((['"]?)(.*?)\1\)/g, (_, _q, rawValue) => {
    const candidate = rawValue?.trim();
    if (!candidate || candidate.startsWith("data:") || candidate.startsWith("#"))
      return `url("${candidate}")`;
    const normalized = normalizeAssetUrl(candidate, sourceUrl);
    const asset = assetLookup.get(normalized);
    if (!asset) return `url("${toPortableHref(candidate, sourceUrl)}")`;
    return `url("${relativeAssetPath(pageFile, asset.localRelativePath)}")`;
  });
}

function rewriteSrcset(value, pageUrl, assetLookup, pageFile) {
  return value.split(",").map(part => {
    const trimmed = part.trim();
    if (!trimmed) return trimmed;
    const [urlPart, descriptor] = trimmed.split(/\s+/, 2);
    const normalized = normalizeAssetUrl(urlPart, pageUrl);
    const asset = assetLookup.get(normalized);
    const finalUrl = asset
      ? relativeAssetPath(pageFile, asset.localRelativePath)
      : toPortableHref(urlPart, pageUrl);
    return descriptor ? `${finalUrl} ${descriptor}` : finalUrl;
  }).join(", ");
}

function rewriteStyleValue(value, pageUrl, assetLookup, pageFile) {
  return value.replace(/url\((['"]?)(.*?)\1\)/g, (_, _q, rawValue) => {
    const normalized = normalizeAssetUrl(rawValue, pageUrl);
    const asset = assetLookup.get(normalized);
    if (!asset) return `url("${toPortableHref(rawValue, pageUrl)}")`;
    return `url("${relativeAssetPath(pageFile, asset.localRelativePath)}")`;
  });
}

// ---------------------------------------------------------------------------
// Page lookup helpers
// ---------------------------------------------------------------------------

function buildPageLookups(pages = []) {
  const exactUrlSet = new Set();
  const pathnameToPageUrl = new Map();

  for (const page of pages) {
    const pageUrl = page.normalizedUrl || page.url;
    if (!pageUrl) continue;
    exactUrlSet.add(pageUrl);
    const parsed = safeUrl(pageUrl, pageUrl);
    if (!parsed) continue;
    const pathname = normalizePathname(parsed.pathname);
    if (!pathnameToPageUrl.has(pathname)) pathnameToPageUrl.set(pathname, pageUrl);
  }

  return { exactUrlSet, pathnameToPageUrl };
}

function resolveInternalPageTarget(currentValue, pageUrl, exactUrlSet, pathnameToPageUrl) {
  const normalized = normalizeUrl(currentValue, pageUrl);
  if (!normalized) return null;
  if (exactUrlSet.has(normalized)) return normalized;
  const parsed = safeUrl(normalized, pageUrl);
  if (!parsed) return null;
  const currentOrigin = safeUrl(pageUrl, pageUrl)?.origin;
  if (!currentOrigin || parsed.origin !== currentOrigin) return null;
  const pathname = normalizePathname(parsed.pathname);
  return pathnameToPageUrl.get(pathname) || null;
}

// ---------------------------------------------------------------------------
// Source-domain metadata removal (domain-agnostic — no hardcoded hostname)
// ---------------------------------------------------------------------------

function removeSourceDomainMetadata($, pageUrl) {
  $("link[rel='canonical']").remove();
  $("meta[property='og:url']").remove();

  let hostname = null;
  try { hostname = new URL(pageUrl).hostname.replace(/^www\./, ""); } catch {}

  if (!hostname) return;

  const escapedHost = hostname.replace(/\./g, "\\.");
  const domainRe = new RegExp(`https?://(www\\.)?${escapedHost}[^"'\\s<>]*`, "gi");

  $("meta[content]").each((_, el) => {
    const v = $(el).attr("content") || "";
    if (domainRe.test(v)) {
      domainRe.lastIndex = 0;
      $(el).attr("content", v.replace(domainRe, ""));
    }
    domainRe.lastIndex = 0;
  });

  $("script[type='application/ld+json']").each((_, el) => {
    const txt = $(el).html() || "";
    if (!txt) return;
    domainRe.lastIndex = 0;
    $(el).html(txt.replace(domainRe, ""));
  });
}

// ---------------------------------------------------------------------------
// Non-portable script removal
// ---------------------------------------------------------------------------

function stripNonPortableScripts($) {
  $("script[src]").each((_, el) => {
    const src = ($(el).attr("src") || "").trim();
    if (
      /ppslider\.netlify\.com|api\.fastbundle\.co|sdk\.postscript\.io|static\.klaviyo\.com|a\.klaviyo\.com|route\.com|instafeed|uppromote|trekkie|fbevents|connect\.facebook\.net|googletagmanager\.com|google-analytics\.com|snap\.licdn\.com|bat\.bing\.com/i.test(src)
    ) {
      $(el).remove();
    }
  });

  $("script:not([src])").each((_, el) => {
    const text = $(el).html() || "";
    if (
      /shopify-checkout-api-token|Shopify\.shop\s*=|Shopify\.cdnHost|FastBundleConf|klaviyo\.identify|window\.klaviyo|window\.Klaviyo|analytics\.track|fbq\(|gtag\(|dataLayer\.push/i.test(text)
    ) {
      $(el).remove();
    }
  });
}

// ---------------------------------------------------------------------------
// Portable runtime injection
// ---------------------------------------------------------------------------

function appendPortableRuntime($) {
  if ($("#clone-portable-runtime").length) return;

  const code = `
(function(){
'use strict';
if(window.__cloneRtLoaded)return;
window.__cloneRtLoaded=true;

/* Utility */
function isVisible(el){
  if(!el)return false;
  const s=window.getComputedStyle(el);
  return s.display!=='none'&&s.visibility!=='hidden'&&parseFloat(s.opacity)>0;
}

/* Link normalisation — root-relative for same origin */
function toPortablePath(href){
  try{const u=new URL(href,window.location.href);
    if(u.origin===window.location.origin)return u.pathname+u.search+u.hash;
  }catch{}
  return href;
}
function normalizeLinks(){
  document.querySelectorAll('a[href]').forEach(function(n){
    const h=n.getAttribute('href')||'';
    if(/^https?:\\/\\//i.test(h))n.setAttribute('href',toPortablePath(h));
  });
  document.querySelectorAll('form[action]').forEach(function(f){
    const a=f.getAttribute('action')||'';
    if(/^https?:\\/\\//i.test(a))f.setAttribute('action',toPortablePath(a));
  });
}

/* Dialog / popup close */

/* FIX 1 - getDialogLike: was only matching 7 selectors, missing most real-world
   popup containers (.newsletter-popup, [class*="popup"], fixed overlays etc).
   Now walks up the DOM and checks class names for popup/modal/overlay patterns. */
function getDialogLike(node){
  if(!node)return null;
  var semantic=node.closest('dialog,[role="dialog"],coretex-dialog,.coretex-dialog,[aria-modal="true"]');
  if(semantic)return semantic;
  var el=node;
  while(el&&el!==document.body){
    var cls=typeof el.className==='string'?el.className.toLowerCase():'';
    if(
      /\bpopup\b/.test(cls)||/\bmodal\b/.test(cls)||/\boverlay\b/.test(cls)||
      /\bdialog\b/.test(cls)||/\bdrawer\b/.test(cls)||/\blightbox\b/.test(cls)||
      /newsletter[\-_]?popup/i.test(cls)||/popup[\-_]?wrapper/i.test(cls)||
      /popup[\-_]?container/i.test(cls)||/modal[\-_]?wrapper/i.test(cls)
    ){
      return el;
    }
    el=el.parentElement;
  }
  return null;
}

function closeDialog(el){
  if(!el)return;
  var nd=el.tagName&&el.tagName.toLowerCase()==='dialog'?el:el.querySelector&&el.querySelector('dialog');
  if(nd&&typeof nd.close==='function'){try{nd.close();}catch(x){} nd.removeAttribute('open');}
  el.removeAttribute('open');
  el.setAttribute('aria-hidden','true');
  el.classList.remove('open','is-open','show','is-active','active','visible');
  el.classList.add('is-closed');
  if(el.style){el.style.display='none';el.style.pointerEvents='none';}
  ['modal-open','popup-open','overflow-hidden','no-scroll','lock-scroll'].forEach(function(c){
    document.documentElement.classList.remove(c);
    document.body.classList.remove(c);
  });
  document.documentElement.style.overflow='';
  document.body.style.overflow='';
  document.body.style.position='';
}

/* FIX 2+3+4 - shouldClose rewrites:
   a) Added [class*="close"] so .popup__close / .btn-close etc work.
   b) FIX 3: Was /\\\\s+/g (matched literal \\s, NOT whitespace). Fixed to /\s+/g.
   c) FIX 4: SVG path/circle targets - walk up to nearest real ancestor first.
   d) Added x-char check for icon-only close buttons (x, x, x glyph variants).
   e) Changed exact-match to .includes() for "no thanks" to handle punctuation. */
function shouldClose(target,dlg){
  if(!target||!dlg)return false;

  /* FIX 4: SVG elements have no useful class/text - walk up to real element first */
  var realTarget=target;
  if(target.tagName&&/^(svg|path|circle|use|g|polyline|rect|line|polygon)$/i.test(target.tagName)){
    realTarget=target.closest('button,a,[role="button"],[class*="close"],[class*="dismiss"]')||target.parentElement||target;
  }

  /* FIX 2a: broadened class selector - was .close-button only, now [class*="close"] */
  if(realTarget.closest(
    '[data-close],[data-dismiss],[formmethod="dialog"],' +
    '.close-button,.js-close,' +
    '[class*="close"],[class*="dismiss"],[class*="btn-close"],' +
    '[aria-label*="close" i],[aria-label*="dismiss" i],[aria-label*="no thanks" i]'
  ))return true;

  var ae=realTarget.closest('button,a,[role="button"],span,div');
  if(ae){
    /* FIX 2b: was /\\\\s+/g (wrong) - correct regex for whitespace is /\s+/g */
    var raw=ae.textContent||ae.value||ae.getAttribute('aria-label')||'';
    var lbl=raw.replace(/\s+/g,' ').replace(/[,\.!]/g,'').trim().toLowerCase();
    var cls2=(typeof ae.className==='string'?ae.className:'').toLowerCase();

    /* FIX 2d: x-char icon-only close buttons (x, x, x and similar Unicode) */
    if(lbl==='x'||lbl==='\u00d7'||lbl==='\u2715'||lbl==='\u2716'||lbl==='\u274c')return true;

    /* FIX 2e: .includes() handles "no, thanks" / "no thanks!" variants */
    var closeWords=['no thanks','close','dismiss','skip','build muscle',
      'lose fat','improve performance','overall health','claim discount','maybe later',
      'got it','i understand'];
    if(closeWords.some(function(w){return lbl.includes(w);}))return true;

    if(/close|dismiss|cancel|no[\-_]?thanks/i.test(cls2))return true;
  }

  return false;
}

function isOverlay(target,dlg){
  if(!target||!dlg)return false;
  if(target===dlg)return true;
  var cls=(target.className||'').toLowerCase();
  if(/overlay|backdrop|scrim|modal-bg|popup-bg/.test(cls)||target.hasAttribute('data-overlay'))return true;
  var box=dlg.querySelector('.dialog-content,.modal-content,.popup-content,.popup__inner,.modal__inner');
  if(box&&!box.contains(target)&&dlg.contains(target))return true;
  return false;
}

document.addEventListener('click',function(e){
  var t=e.target;
  var d=getDialogLike(t);
  if(d&&isVisible(d)&&(shouldClose(t,d)||isOverlay(t,d))){
    window.setTimeout(function(){closeDialog(d);},0);
  }
},true);

document.addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  var ds=Array.from(document.querySelectorAll(
    'dialog[open],.coretex-dialog,coretex-dialog,[role="dialog"],[aria-modal="true"],.popup.open,.modal.open'
  )).filter(isVisible);
  if(ds.length)closeDialog(ds[ds.length-1]);
});

/* Sticky header */
function initStickyHeader(){
  const h=document.querySelector('header,[role="banner"],.site-header,.header');
  if(!h)return;
  let ticking=false;
  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(function(){
        const s=window.scrollY>8;
        h.classList.toggle('clone-is-scrolled',s);
        h.classList.toggle('is-scrolled',s);
        h.classList.toggle('scrolled',s);
        ticking=false;
      });
      ticking=true;
    }
  }
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});
}

/* Slider fallback */
function initSliders(){
  document.querySelectorAll('.splide:not(.is-initialized),.swiper:not(.swiper-initialized),.glide:not(.glide--swipeable),[data-slider],[data-carousel]').forEach(function(sl){
    const track=sl.querySelector('.splide__track,.swiper-wrapper,.glide__track,[data-slider-track],.slider-track');
    const slides=track
      ?track.querySelectorAll('.splide__slide,.swiper-slide,.glide__slide,[data-slide],.slide')
      :sl.querySelectorAll('[data-slide],.slide,.carousel-item');
    if(!slides.length||sl.dataset.cloneSliderInit)return;
    let cur=0;
    function show(i){slides.forEach(function(s,j){s.style.display=j===i?'':'none';s.setAttribute('aria-hidden',String(j!==i));});}
    const nb=sl.querySelector('[class*="next"],[aria-label*="next" i],[data-next]');
    const pb=sl.querySelector('[class*="prev"],[aria-label*="prev" i],[data-prev]');
    if(nb)nb.addEventListener('click',function(){cur=(cur+1)%slides.length;show(cur);});
    if(pb)pb.addEventListener('click',function(){cur=(cur-1+slides.length)%slides.length;show(cur);});
    show(0);
    sl.dataset.cloneSliderInit='true';
  });
}

/* Scroll-reveal animations */
function initAnimations(){
  const targets=document.querySelectorAll('[data-aos],[data-reveal],.animate-on-scroll,[class*="fade-in"],[class*="slide-up"],.js-animate');
  if(!targets.length)return;
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          en.target.classList.add('clone-revealed','aos-animate','animated');
          en.target.removeAttribute('data-aos');
          io.unobserve(en.target);
        }
      });
    },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
    targets.forEach(function(el){io.observe(el);});
  } else {
    targets.forEach(function(el){el.classList.add('clone-revealed','aos-animate','animated');});
  }
}

/* Mobile menu */
function initMobileMenu(){
  document.querySelectorAll('[data-menu-toggle],[data-nav-toggle],.hamburger,.menu-toggle,[aria-controls*="nav" i],[aria-controls*="menu" i]').forEach(function(btn){
    btn.addEventListener('click',function(){
      const tid=btn.getAttribute('aria-controls')||btn.getAttribute('data-target');
      let m=tid?document.getElementById(tid)||document.querySelector('[data-nav="'+tid+'"]'):null;
      if(!m)m=document.querySelector('nav,.nav,.navigation,.site-nav,.mobile-nav');
      if(m){const o=m.classList.toggle('is-open');m.classList.toggle('open',o);btn.setAttribute('aria-expanded',String(o));}
    });
  });
}

/* Lazy images */
function initLazyImages(){
  const imgs=document.querySelectorAll('img[data-src]');
  if(!imgs.length)return;
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting)return;
        const img=en.target;
        if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}
        if(img.dataset.srcset){img.srcset=img.dataset.srcset;delete img.dataset.srcset;}
        io.unobserve(img);
      });
    });
    imgs.forEach(function(i){io.observe(i);});
  } else {
    imgs.forEach(function(i){if(i.dataset.src)i.src=i.dataset.src;});
  }
}

/* Boot */
normalizeLinks();
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',function(){initStickyHeader();initSliders();initAnimations();initMobileMenu();initLazyImages();});
} else {
  initStickyHeader();initSliders();initAnimations();initMobileMenu();initLazyImages();
}
})();
`.trim();

  const script = `<script id="clone-portable-runtime">${code}</script>`;

  if ($("body").length) {
    $("body").append(script);
  } else {
    $.root().append(script);
  }
}

// ---------------------------------------------------------------------------
// Main HTML rewriter
// ---------------------------------------------------------------------------

async function rewritePageHtml(page, exactUrlSet, pathnameToPageUrl, assetLookup) {
  const pageUrl = page.normalizedUrl || page.url;
  const pageFile = toPageOutputPath(pageUrl);
  const $ = cheerio.load(page.html || "", { decodeEntities: false });

  $("a[href]").each((_, el) => {
    const current = ($(el).attr("href") || "").trim();
    if (!current || isSpecialProtocol(current)) return;

    const targetPageUrl = resolveInternalPageTarget(current, pageUrl, exactUrlSet, pathnameToPageUrl);
    if (targetPageUrl) {
      $(el).attr("href", appendSearchAndHash(relativePagePath(pageUrl, targetPageUrl), current, pageUrl));
      return;
    }
    // KEY FIX: root-relative for same-origin, NOT full source-domain URL
    $(el).attr("href", toPortableHref(current, pageUrl));
  });

  $("form[action]").each((_, el) => {
    const current = ($(el).attr("action") || "").trim();
    if (!current || isSpecialProtocol(current)) return;
    const targetPageUrl = resolveInternalPageTarget(current, pageUrl, exactUrlSet, pathnameToPageUrl);
    if (targetPageUrl) {
      $(el).attr("action", appendSearchAndHash(relativePagePath(pageUrl, targetPageUrl), current, pageUrl));
      return;
    }
    $(el).attr("action", toPortableHref(current, pageUrl));
  });

  $("[src]").each((_, el) => {
    const current = $(el).attr("src");
    if (!current || isSpecialProtocol(current)) return;
    const asset = assetLookup.get(normalizeAssetUrl(current, pageUrl));
    $(el).attr("src", asset ? relativeAssetPath(pageFile, asset.localRelativePath) : toPortableHref(current, pageUrl));
  });

  $("link[href]").each((_, el) => {
    const current = $(el).attr("href");
    if (!current || isSpecialProtocol(current)) return;
    const asset = assetLookup.get(normalizeAssetUrl(current, pageUrl));
    $(el).attr("href", asset ? relativeAssetPath(pageFile, asset.localRelativePath) : toPortableHref(current, pageUrl));
  });

  $("[poster]").each((_, el) => {
    const current = $(el).attr("poster");
    if (!current) return;
    const asset = assetLookup.get(normalizeAssetUrl(current, pageUrl));
    $(el).attr("poster", asset ? relativeAssetPath(pageFile, asset.localRelativePath) : toPortableHref(current, pageUrl));
  });

  $("[srcset]").each((_, el) => {
    const current = $(el).attr("srcset");
    if (current) $(el).attr("srcset", rewriteSrcset(current, pageUrl, assetLookup, pageFile));
  });

  $("[data-src]").each((_, el) => {
    const current = $(el).attr("data-src");
    if (!current) return;
    const asset = assetLookup.get(normalizeAssetUrl(current, pageUrl));
    $(el).attr("data-src", asset ? relativeAssetPath(pageFile, asset.localRelativePath) : toPortableHref(current, pageUrl));
  });

  $("[data-srcset]").each((_, el) => {
    const current = $(el).attr("data-srcset");
    if (current) $(el).attr("data-srcset", rewriteSrcset(current, pageUrl, assetLookup, pageFile));
  });

  $("[style]").each((_, el) => {
    const current = $(el).attr("style");
    if (current?.includes("url(")) $(el).attr("style", rewriteStyleValue(current, pageUrl, assetLookup, pageFile));
  });

  $("style").each((_, el) => {
    const current = $(el).html();
    if (current?.includes("url(")) $(el).html(replaceCssUrls(current, pageUrl, assetLookup, pageFile));
  });

  removeSourceDomainMetadata($, pageUrl);
  stripNonPortableScripts($);
  appendPortableRuntime($);

  return $.html();
}

// ---------------------------------------------------------------------------
// Asset copy
// ---------------------------------------------------------------------------

async function copyStaticAssets(assetManifest) {
  const assetLookup = new Map();
  const copied = [];

  for (const asset of assetManifest.assets || []) {
    const sourcePath = asset.localPath || path.join(process.cwd(), "output", "assets", asset.localRelativePath);
    if (!(await fs.pathExists(sourcePath))) continue;

    const targetPath = path.join(STATIC_PUBLIC_DIR, "assets", asset.localRelativePath);
    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(sourcePath, targetPath);

    assetLookup.set(asset.normalizedUrl, asset);
    copied.push({ url: asset.normalizedUrl, localRelativePath: asset.localRelativePath, type: asset.type });
  }

  return { assetLookup, copied };
}

// ---------------------------------------------------------------------------
// Hosting support files
// ---------------------------------------------------------------------------

async function writeHostingSupportFiles() {
  const htaccess = `Options -Indexes
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !\\.[a-zA-Z0-9]{1,5}$
RewriteCond %{REQUEST_URI} !/$
RewriteRule ^(.+)$ /$1/ [R=301,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}/index.html -f
RewriteRule ^(.+)$ /$1/index.html [L]
ErrorDocument 404 /404.html
`;

  const vercelConfig = {
    cleanUrls: true,
    trailingSlash: false,
    rewrites: [
      { source: "/products/:path*", destination: "/products/:path*/index.html" },
      { source: "/collections/:path*", destination: "/collections/:path*/index.html" },
      { source: "/pages/:path*", destination: "/pages/:path*/index.html" },
      { source: "/blogs/:path*", destination: "/blogs/:path*/index.html" },
      { source: "/(.*)", destination: "/$1/index.html" }
    ],
    headers: [
      { source: "/assets/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/(.*)\\.html", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }] }
    ]
  };

  const netlifyToml = `[[redirects]]
  from = "/*"
  to = "/:splat/index.html"
  status = 200
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`;

  const notFound = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page not found</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:40px;background:#fff;color:#111}.wrap{max-width:720px;margin:0 auto}a{color:#111}</style>
</head><body><div class="wrap"><h1>Page not found</h1><p>The requested page is not available in this exported clone.</p><p><a href="/">Return to homepage</a></p></div></body></html>`;

  await fs.writeFile(path.join(STATIC_PUBLIC_DIR, ".htaccess"), htaccess, "utf8");
  await fs.writeFile(path.join(STATIC_PUBLIC_DIR, "404.html"), notFound, "utf8");
  await fs.writeJSON(path.join(STATIC_PUBLIC_DIR, "vercel.json"), vercelConfig, { spaces: 2 });
  await fs.writeFile(path.join(STATIC_PUBLIC_DIR, "netlify.toml"), netlifyToml, "utf8");
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export async function exportStaticSite(input = {}) {
  await ensureBaseOutputStructure();

  const crawlResults = input.crawlResults || (await readJson(ARTIFACTS.crawlResults, "crawl results"));
  const assetManifest = input.assetManifest || (await readJson(ARTIFACTS.assetManifest, "asset manifest"));

  await fs.emptyDir(STATIC_PUBLIC_DIR);
  await fs.ensureDir(STATIC_PUBLIC_DIR);

  const { assetLookup, copied } = await copyStaticAssets(assetManifest);
  const pages = crawlResults.pages || [];
  const { exactUrlSet, pathnameToPageUrl } = buildPageLookups(pages);
  const exportedPages = [];

  for (const page of pages) {
    const pageUrl = page.normalizedUrl || page.url;
    const filePath = toPageOutputPath(pageUrl);
    const html = await rewritePageHtml(page, exactUrlSet, pathnameToPageUrl, assetLookup);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, html, "utf8");

    exportedPages.push({ url: pageUrl, route: toRoutePath(pageUrl), file: filePath });
  }

  await writeHostingSupportFiles();

  await fs.ensureDir(ROOT_PUBLIC_DIR);
  await fs.emptyDir(ROOT_PUBLIC_DIR);
  await fs.copy(STATIC_PUBLIC_DIR, ROOT_PUBLIC_DIR);

  const manifest = {
    createdAt: new Date().toISOString(),
    totalPages: exportedPages.length,
    copiedAssets: copied.length,
    outputDir: STATIC_PUBLIC_DIR,
    rootPublicDir: ROOT_PUBLIC_DIR,
    pages: exportedPages
  };

  await writeJson(ARTIFACTS.staticManifest, manifest);
  logStep("static", `Exported ${exportedPages.length} pages to ${STATIC_PUBLIC_DIR} (+ vercel.json + netlify.toml + .htaccess)`);

  return manifest;
}

export async function run() { return exportStaticSite(); }

if (process.argv[1]?.endsWith("export-static-site.js")) {
  run().catch(error => { console.error(`[static] Export failed: ${error.message}`); process.exit(1); });
}
