import path from "path";
import fs from "fs-extra";
import * as cheerio from "cheerio";

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

/* =========================================================
   HELPERS
========================================================= */

function isSpecialProtocol(v = "") {
  return /^(mailto:|tel:|javascript:|data:|blob:|#)/i.test(v);
}

function safeUrl(url, base) {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
}

function normalizePathname(p = "/") {
  let next = (p || "/").replace(/\/+/g, "/");
  if (!next.startsWith("/")) next = `/${next}`;
  if (next !== "/" && next.endsWith("/")) next = next.slice(0, -1);
  return next || "/";
}

/* =========================================================
   DOMAIN-INDEPENDENT FIX - COMPLETE REWRITE
========================================================= */

function toPortableHref(candidate, pageUrl) {
  if (!candidate || isSpecialProtocol(candidate)) return candidate;
  
  const resolved = safeUrl(candidate, pageUrl);
  const base = safeUrl(pageUrl, pageUrl);

  if (!resolved || !base) return candidate;

  // If same origin, convert to root-relative path
  if (resolved.origin === base.origin) {
    const pathname = resolved.pathname + resolved.search + resolved.hash;
    return pathname || "/";
  }

  // External link - keep as-is (or could redirect to home)
  return candidate;
}

function toLocalPath(url, pageUrl) {
  if (!url || isSpecialProtocol(url)) return url;
  
  const resolved = safeUrl(url, pageUrl);
  if (!resolved) return url;
  
  // If it's a same-origin URL, return the path
  const base = safeUrl(pageUrl, pageUrl);
  if (resolved.origin === base.origin) {
    return resolved.pathname + resolved.search + resolved.hash;
  }
  
  // External URL - return as-is
  return url;
}

function safeFallbackUrl(url, pageUrl) {
  try {
    const u = new URL(url, pageUrl);
    if (u.origin === new URL(pageUrl).origin) {
      return u.pathname + u.search + u.hash;
    }
    return url;
  } catch {
    return url;
  }
}

/* =========================================================
   PATH HELPERS
========================================================= */

function toPageOutputPath(pageUrl) {
  const pathname = normalizePathname(new URL(pageUrl).pathname);
  if (pathname === "/") return path.join(STATIC_PUBLIC_DIR, "index.html");
  return path.join(STATIC_PUBLIC_DIR, pathname.replace(/^\/+/, ""), "index.html");
}

function toRoutePath(pageUrl) {
  const pathname = normalizePathname(new URL(pageUrl).pathname);
  return pathname === "/" ? "/" : `${pathname}/`;
}

function relativeAssetPath(fromFile, localPath) {
  const target = path.join(STATIC_PUBLIC_DIR, "assets", localPath);
  return path.relative(path.dirname(fromFile), target).replace(/\\/g, "/");
}

/* =========================================================
   REMOVE DOMAIN FROM META
========================================================= */

function removeSourceDomainMetadata($, pageUrl) {
  $("link[rel='canonical']").remove();
  $("meta[property='og:url']").remove();

  let host;
  try {
    host = new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {}

  if (!host) return;

  const esc = host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(https?:)?//(www\\.)?${esc}[^"'\\s<>]*`, "gi");
  const reEscaped = new RegExp(`(https?:)?\\\\?/\\\\?/(www\\\\.)?${esc}[^"'\\\\s<>]*`, "gi");
  const cdnRe = /(https?:)?\/\/[^"'\\s<>]*cdn\.shopify\.com[^"'\\s<>]*/gi;

  // Strip from meta content
  $("meta[content]").each((_, el) => {
    const v = $(el).attr("content") || "";
    const stripped = v.replace(re, "").replace(cdnRe, "");
    $(el).attr("content", stripped);
  });

  // Strip from JSON-LD
  $("script[type='application/ld+json']").each((_, el) => {
    const txt = $(el).html() || "";
    const stripped = txt.replace(re, "").replace(reEscaped, "").replace(cdnRe, "");
    $(el).html(stripped);
  });

  // Strip shopUrl and components from inline JavaScript
  $("script:not([src])").each((_, el) => {
    let html = $(el).html() || "";
    let modified = false;
    
    if (/shopUrl\s*=/i.test(html)) {
      html = html
        .replace(/shopUrl\s*=\s*["'][^"']*["']/gi, "shopUrl = '/'")
        .replace(re, "")
        .replace(cdnRe, "");
      modified = true;
    }
    
    if (/components\s*=\s*\{/i.test(html)) {
      html = html
        .replace(re, "")
        .replace(cdnRe, "");
      modified = true;
    }
    
    if (modified) {
      $(el).html(html);
    }
  });

  // Remove Shopify analytics scripts
  $("script").each((_, el) => {
    const $el = $(el);
    const src = $el.attr("src") || "";
    const id = $el.attr("id") || "";
    const dataAttr = $el.attr("data-source-attribution") || "";
    
    // Remove Shopify analytics, Yotpo, and tracking scripts
    if (/trekkie|shopify-perf|shop_events|monorail|yotpo|fbevents|shopifycdn/i.test(src)) {
      $el.remove();
      return;
    }
    
    // Remove scripts with Shopify IDs or data attributes
    if (/shopify-digital-wallet|apple-pay-shop/i.test(id)) {
      $el.remove();
      return;
    }
    if (/shopify\.loadfeatures/i.test(dataAttr)) {
      $el.remove();
      return;
    }
    
    // Remove inline Shopify modules and analytics
    const html = $el.html() || "";
    if (/__st\s*=|Shopify.*analytics|trekkie.*create|sendBeacon.*monorail|abandonment_tracked|shopify_s=|Shopify.*modules|ShopifyPay\s*=|Shopify.*loadFeatures|ShopifyPaypal/i.test(html)) {
      $el.remove();
    }
  });

  // Remove Shopify stylesheets and style blocks
  $("link[id]").each((_, el) => {
    const id = $(el).attr("id") || "";
    if (/shopify-accelerated-checkout/i.test(id)) {
      $(el).remove();
    }
  });

  $("style[id]").each((_, el) => {
    const id = $(el).attr("id") || "";
    if (/shopify-buyer-consent|shopify-accelerated/i.test(id)) {
      $(el).remove();
    }
  });

  // Remove Shopify meta tags
  $("meta[name]").each((_, el) => {
    const name = $(el).attr("name") || "";
    if (/shopify-|digital-wallet/i.test(name)) {
      $(el).remove();
    }
  });

  // Remove data-* attributes containing domain info
  $("[data-storefront-base-url], [data-extension-base-url], [data-shop-id], [data-monorail]").each((_, el) => {
    $(el).remove();
  });
}

/* =========================================================
   REMOVE NON-PORTABLE SCRIPTS
========================================================= */

function stripNonPortableScripts($) {
  const stripPatterns = /web-pixels|shopifycloud|monorail|klaviyo|gtag|facebook|analytics|instafeed|shopify\.payments|connect\.facebook\.net/i;
  
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (stripPatterns.test(src)) {
      $(el).remove();
    }
  });
  
  $("iframe[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (stripPatterns.test(src)) {
      $(el).remove();
    }
  });

  $("script:not([src])").each((_, el) => {
    const txt = $(el).html() || "";
    if (/Shopify\.|klaviyo|analytics|fbq|gtag|webPixels/i.test(txt)) {
      $(el).remove();
    }
  });
}

/* =========================================================
   RUNTIME FALLBACK JAVASCRIPT
========================================================= */

function injectRuntimeJavaScript($) {
  const runtimeScript = `
(function() {
  'use strict';
  
  // ============================================================
  // 🔄 DYNAMIC DOMAIN CONFIGURATION
  // Works with ANY domain after deployment - no rebuild needed!
  // Just edit store-config.js to change the store URL
  // ============================================================
  
  // DEFAULT: Site works on current domain (static pages)
  // STORE: Redirects to actual store (Shopify/Wix) for cart/checkout
  // 
  // To change store URL AFTER deployment:
  // 1. Edit /store-config.js on your hosting
  // 2. Or use Admin Panel (if enabled)
  // ============================================================
  
  var StoreConfig = {
    // Default store URL - CHANGE THIS AFTER DEPLOYMENT
    // For Wix (hdmuscle.in): use product-page/{name} format
    storeUrl: '',
    
    // Fallback if no config
    getStoreUrl: function() {
      return this.storeUrl || window.location.origin;
    },
    
    // Check for external config file
    load: function(callback) {
      // Try to load store-config.js
      var script = document.createElement('script');
      script.src = '/store-config.js?v=' + Date.now();
      script.onload = callback;
      script.onerror = callback;
      document.head.appendChild(script);
    }
  };
  
  // Initialize config
  StoreConfig.load(function() {
    initStoreLinks();
  });
  
  // Update cart/checkout/account links to point to actual store
  function initStoreLinks() {
    var storeUrl = StoreConfig.getStoreUrl();
    
    // Update add-to-cart forms
    document.querySelectorAll('form[action*="/cart/add"], form[action*="/cart/add/"]').forEach(function(form) {
      form.setAttribute('action', storeUrl + '/cart/add');
      form.setAttribute('target', '_blank');
      form.setAttribute('data-store-action', 'add-to-cart');
    });
    
    // Update cart links
    document.querySelectorAll('a[href*="/cart"], a[href="/cart"]').forEach(function(link) {
      link.setAttribute('href', storeUrl + '/cart');
      link.setAttribute('target', '_blank');
    });
    
    // Update checkout links
    document.querySelectorAll('a[href*="/checkout"]').forEach(function(link) {
      link.setAttribute('href', storeUrl + '/checkout');
      link.setAttribute('target', '_blank');
    });
    
    // Update account links
    document.querySelectorAll('a[href*="/account"]').forEach(function(link) {
      link.setAttribute('href', storeUrl + '/account');
      link.setAttribute('target', '_blank');
    });
  }
  
  // ============================================================
  // UI INTERACTIONS
  // ============================================================
  
  // Popup / Modal close functionality
  document.addEventListener('click', function(e) {
    // Close button handling
    if (e.target.matches('.popup-close, .modal-close, [data-close-popup], .close-btn, .mfp-close')) {
      var popup = e.target.closest('.popup, .modal, .mfp-wrap, [role="dialog"]');
      if (popup) {
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
      }
    }
    
    // Newsletter popup dismiss
    if (e.target.matches('[data-newsletter-close], .newsletter-popup .close')) {
      var newsletter = document.querySelector('.newsletter-popup, .popup-newsletter');
      if (newsletter) {
        newsletter.style.display = 'none';
        localStorage.setItem('newsletter_dismissed', 'true');
      }
    }
  });

  // Mobile menu toggle
  document.addEventListener('click', function(e) {
    if (e.target.matches('.mobile-menu-toggle, .menu-toggle, .hamburger, [data-menu-toggle]')) {
      var menu = document.querySelector('.mobile-menu, .nav-mobile, .site-nav-mobile');
      if (menu) {
        menu.classList.toggle('active');
        menu.classList.toggle('open');
        menu.style.display = menu.classList.contains('active') ? 'block' : 'none';
      }
    }
    
    // Mobile menu close
    if (e.target.matches('.mobile-menu-close, .close-mobile-menu')) {
      var menu = document.querySelector('.mobile-menu.active, .nav-mobile.open');
      if (menu) {
        menu.classList.remove('active', 'open');
        menu.style.display = 'none';
      }
    }
  });

  // Sticky header on scroll
  var header = document.querySelector('.header, .site-header, .sticky-header, [data-sticky]');
  if (header) {
    var lastScroll = 0;
    window.addEventListener('scroll', function() {
      var currentScroll = window.pageYOffset;
      if (currentScroll > 100) {
        header.classList.add('scrolled', 'sticky');
      } else {
        header.classList.remove('scrolled', 'sticky');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // Accordion / FAQ toggle
  document.addEventListener('click', function(e) {
    if (e.target.matches('.accordion-title, .faq-question, [data-accordion-toggle]')) {
      var item = e.target.closest('.accordion-item, .faq-item');
      if (item) {
        var content = item.querySelector('.accordion-content, .faq-answer, .panel');
        var isOpen = item.classList.contains('active');
        
        // Close all siblings
        var siblings = item.parentElement.querySelectorAll('.accordion-item.active, .faq-item.active');
        siblings.forEach(function(sib) {
          if (sib !== item) {
            sib.classList.remove('active');
            var sibContent = sib.querySelector('.accordion-content, .faq-answer, .panel');
            if (sibContent) sibContent.style.display = 'none';
          }
        });
        
        // Toggle current
        item.classList.toggle('active');
        if (content) {
          content.style.display = isOpen ? 'none' : 'block';
        }
      }
    }
  });

  // Product variant selection
  document.addEventListener('click', function(e) {
    if (e.target.matches('.variant-input, .swatch-input, [data-variant]')) {
      var container = e.target.closest('.product-variants, .variant-wrapper');
      if (container) {
        container.querySelectorAll('.variant-input, .swatch-input, [data-variant]').forEach(function(input) {
          input.classList.remove('selected');
          input.removeAttribute('selected');
        });
        e.target.classList.add('selected');
        e.target.setAttribute('selected', 'true');
      }
    }
  });

  // Form validation fallback
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form.matches('.newsletter-form, [data-newsletter-form]')) {
      var emailInput = form.querySelector('input[type="email"]');
      if (emailInput && !emailInput.value.includes('@')) {
        e.preventDefault();
        alert('Please enter a valid email address.');
      }
    }
  });

  // Image lazy loading fallback
  if ('IntersectionObserver' in window) {
    var lazyImages = document.querySelectorAll('img[data-src], img[data-lazy-src]');
    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          var src = img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.removeAttribute('data-lazy-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });
    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // Tab switching
  document.addEventListener('click', function(e) {
    if (e.target.matches('.tab-link, .tab-btn, [data-tab]')) {
      var tabId = e.target.getAttribute('href') || e.target.getAttribute('data-tab');
      var tabContainer = e.target.closest('.tabs, .tab-wrapper');
      
      if (tabContainer) {
        tabContainer.querySelectorAll('.tab-link, .tab-btn, [data-tab]').forEach(function(tab) {
          tab.classList.remove('active');
          tab.removeAttribute('aria-selected');
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-selected', 'true');
        
        if (tabId && tabId.startsWith('#')) {
          var tabContent = document.querySelector(tabId);
          if (tabContent) {
            tabContainer.querySelectorAll('.tab-content, .tab-pane').forEach(function(content) {
              content.style.display = 'none';
            });
            tabContent.style.display = 'block';
          }
        }
      }
    }
  });

  // Smooth scroll for anchor links
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href^="#"]');
    if (link) {
      var targetId = link.getAttribute('href').substring(1);
      if (targetId) {
        var target = document.getElementById(targetId) || document.querySelector('[name="' + targetId + '"]');
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });

  // Quantity selector
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.qty-btn, .quantity-btn, [data-qty]');
    if (btn) {
      var input = btn.closest('.quantity-wrapper, .qty-wrapper').querySelector('input[type="number"], input[name="quantity"]');
      if (input) {
        var current = parseInt(input.value) || 1;
        if (btn.classList.contains('qty-minus, .minus, [data-qty="minus"]')) {
          input.value = Math.max(1, current - 1);
        } else if (btn.classList.contains('qty-plus, .plus, [data-qty="plus"]')) {
          input.value = current + 1;
        }
      }
    }
  });
})();
`;

  $("body").append(`<script>${runtimeScript}</script>`);
}

/* =========================================================
   REWRITE HTML - COMPREHENSIVE
========================================================= */

async function rewritePageHtml(page, assetLookup, pageUrl) {
  const file = toPageOutputPath(pageUrl);
  const $ = cheerio.load(page.html || "", { decodeEntities: false });

  // 1. Rewrite all <a href> links
  $("a[href]").each((_, el) => {
    const v = $(el).attr("href");
    if (!v || isSpecialProtocol(v)) return;
    const portPath = toPortableHref(v, pageUrl);
    $(el).attr("href", portPath);
  });

  // 2. Rewrite all <form action> links
  $("form[action]").each((_, el) => {
    const v = $(el).attr("action");
    if (!v || isSpecialProtocol(v)) return;
    const portPath = toPortableHref(v, pageUrl);
    $(el).attr("action", portPath);
  });

  // 3. Rewrite inline onclick handlers (basic)
  $("[onclick]").each((_, el) => {
    const onclick = $(el).attr("onclick") || "";
    const portOnclick = toPortableHref(onclick, pageUrl);
    if (portOnclick !== onclick) {
      $(el).attr("onclick", portOnclick);
    }
  });

  // 4. Rewrite all [src] attributes (img, script, video, audio, source)
  $("img[src], video[src], audio[src], source[src], source[srcset]").each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    const attr = tagName === 'source' ? 'srcset' : 'src';
    const v = $(el).attr(attr);
    if (!v) return;

    const asset = assetLookup.get(normalizeAssetUrl(v, pageUrl));
    if (asset) {
      $(el).attr(attr, relativeAssetPath(file, asset.localRelativePath));
    } else {
      $(el).attr(attr, toLocalPath(v, pageUrl));
    }
  });

  // 5. Rewrite <link href> (CSS, icons)
  $("link[href]").each((_, el) => {
    const v = $(el).attr("href");
    if (!v) return;
    
    // Remove Shopify extension/modulepreload links and dns-prefetch
    if (/shopify\.com|shopifycdn\.com/i.test(v)) {
      $(el).remove();
      return;
    }
    
    const asset = assetLookup.get(normalizeAssetUrl(v, pageUrl));
    if (asset) {
      $(el).attr("href", relativeAssetPath(file, asset.localRelativePath));
    } else {
      $(el).attr("href", toLocalPath(v, pageUrl));
    }
    
    // Remove onload attributes that reference domain (Shopify duplicate detection)
    const onload = $(el).attr("onload") || "";
    if (/\.hdmuscle\.com|cdn\.shopify\.com|querySelector\(/i.test(onload)) {
      $(el).removeAttr("onload");
    }
  });

  // 5b. Remove dns-prefetch to Shopify
  $("link[rel='dns-prefetch']").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (/shopify/i.test(href)) {
      $(el).remove();
    }
  });

  // 6. Rewrite <script src>
  $("script[src]").each((_, el) => {
    const v = $(el).attr("src");
    if (!v) return;
    
    const asset = assetLookup.get(normalizeAssetUrl(v, pageUrl));
    if (asset) {
      $(el).attr("src", relativeAssetPath(file, asset.localRelativePath));
    } else {
      $(el).attr("src", toLocalPath(v, pageUrl));
    }
  });

  // 7. Rewrite inline styles with background-image
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const portStyle = toPortableHref(style, pageUrl);
    if (portStyle !== style) {
      $(el).attr("style", portStyle);
    }
  });

  // 7b. Remove inline style tags containing Shopify CDN font references
  $("style").each((_, el) => {
    const html = $(el).html() || "";
    if (/cdn\.shopify\.com.*font|shopify\.com.*woff/i.test(html)) {
      // Remove just the font-face rules with Shopify CDN
      const cleaned = html.replace(/@font-face\s*\{[^}]*cdn\.shopify\.com[^}]*\}/gi, "");
      $(el).html(cleaned);
    }
  });

  // 8. Rewrite srcset attributes (responsive images)
  $("img[srcset], source[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset") || "";
    if (!srcset) return;
    
    // Parse and rewrite each URL in srcset
    const rewritten = srcset.split(",").map(part => {
      const trimmed = part.trim();
      const spaceIndex = trimmed.lastIndexOf(" ");
      if (spaceIndex === -1) return part;
      
      const url = trimmed.substring(0, spaceIndex);
      const descriptor = trimmed.substring(spaceIndex);
      
      // Check if it's a local asset
      const asset = assetLookup.get(normalizeAssetUrl(url, pageUrl));
      if (asset) {
        return relativeAssetPath(file, asset.localRelativePath) + descriptor;
      }
      
      // Otherwise, strip the domain if same origin
      const localPath = toLocalPath(url, pageUrl);
      return localPath + descriptor;
    }).join(", ");
    
    $(el).attr("srcset", rewritten);
  });

  // 8b. Rewrite video poster and source src attributes
  $("video[poster]").each((_, el) => {
    const poster = $(el).attr("poster") || "";
    if (!poster) return;
    
    const asset = assetLookup.get(normalizeAssetUrl(poster, pageUrl));
    if (asset) {
      $(el).attr("poster", relativeAssetPath(file, asset.localRelativePath));
    } else {
      $(el).attr("poster", toLocalPath(poster, pageUrl));
    }
  });

  $("video source[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (!src) return;
    
    const asset = assetLookup.get(normalizeAssetUrl(src, pageUrl));
    if (asset) {
      $(el).attr("src", relativeAssetPath(file, asset.localRelativePath));
    } else {
      $(el).attr("src", toLocalPath(src, pageUrl));
    }
  });

  // 8c. Remove noscript video elements (they contain external CDN references)
  $("noscript").each((_, el) => {
    const html = $(el).html() || "";
    if (/cdn\.shopify\.com|hdmuscle\.com/i.test(html)) {
      $(el).remove();
    }
  });

  // 8d. Rewrite title attributes that contain URLs
  $("[title]").each((_, el) => {
    const title = $(el).attr("title") || "";
    if (/^https?:\/\//i.test(title)) {
      $(el).attr("title", "");
    }
  });

  // 8. Rewrite data-* attributes that might contain URLs
  const dataUrlAttrs = ['data-src', 'data-lazy-src', 'data-background', 'data-image', 'data-video', 'data-href'];
  dataUrlAttrs.forEach(attr => {
    $(`[${attr}]`).each((_, el) => {
      const v = $(el).attr(attr);
      if (!v) return;
      $(el).attr(attr, toLocalPath(v, pageUrl));
    });
  });

  // 9. Remove source domain from metadata
  removeSourceDomainMetadata($, pageUrl);

  // 10. Strip non-portable scripts
  stripNonPortableScripts($);

  // 11. Inject runtime JavaScript
  injectRuntimeJavaScript($);

  return $.html();
}

/* =========================================================
   COPY ASSETS
========================================================= */

async function copyAssets(assetManifest) {
  const map = new Map();
  const copied = [];

  for (const asset of assetManifest.assets || []) {
    const src = asset.localPath;

    if (!(await fs.pathExists(src))) continue;

    const dest = path.join(STATIC_PUBLIC_DIR, "assets", asset.localRelativePath);

    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest);

    map.set(asset.normalizedUrl, asset);
    copied.push(asset);
  }

  return { assetLookup: map, copied };
}

/* =========================================================
   HOSTING FILES
========================================================= */

async function writeHostingFiles() {
  await fs.ensureDir(STATIC_PUBLIC_DIR);

  // ============================================================
  // 🔑 STORE CONFIG - Edit this file AFTER deployment!
  // ============================================================
  // 
  // HOW TO CHANGE STORE URL:
  // 1. Upload your site to any host (Hostinger, Netlify, etc.)
  // 2. Edit store-config.js in the root folder
  // 3. Set your store URL (Shopify or Wix)
  // 4. Done! No rebuild needed.
  //
  // EXAMPLES:
  //   Shopify:   StoreConfig.storeUrl = 'https://hdmuscle.com';
  //   Wix:       StoreConfig.storeUrl = 'https://hdmuscle.in';
  // ============================================================
  
  await fs.writeFile(
    path.join(STATIC_PUBLIC_DIR, "store-config.js"),
    `// ============================================================
// 🚀 STORE CONFIGURATION
// Edit this file AFTER deploying to change your store URL!
// ============================================================

// Set your actual store URL here
// For Shopify: 'https://yourstore.com'
// For Wix: 'https://yourstore.wixsite.com' (use product-page/{handle} format)

StoreConfig.storeUrl = '';

// Alternative: Set via URL parameter (for testing)
// ?store=https://hdmuscle.com
var urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('store')) {
  StoreConfig.storeUrl = urlParams.get('store');
}

// Alternative: Set via subdomain
// store.yourdomain.com = redirects to your store
var subdomain = window.location.hostname.split('.')[0];
if (subdomain === 'store' && window.location.hostname.includes('.')) {
  StoreConfig.storeUrl = window.location.protocol + '//' + window.location.hostname.replace('store.', '');
}
`,
    "utf8"
  );

  // HTACCESS (WINDOWS SAFE)
  const htPath = path.join(STATIC_PUBLIC_DIR, ".htaccess");
  await fs.writeFile(
    htPath,
    `Options -Indexes
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.+)$ /$1/index.html [L]
ErrorDocument 404 /404.html`,
    "utf8"
  );

  // VERCEL
  await fs.writeJson(
    path.join(STATIC_PUBLIC_DIR, "vercel.json"),
    {
      cleanUrls: true,
      trailingSlash: true,
      rewrites: [
        { source: "/", destination: "/index.html" },
        { source: "/(.*)/", destination: "/$1/index.html" }
      ]
    },
    { spaces: 2 }
  );

  // NETLIFY
  await fs.writeFile(
    path.join(STATIC_PUBLIC_DIR, "_redirects"),
    `/*    /index.html   200`,
    "utf8"
  );

  // 404
  await fs.writeFile(
    path.join(STATIC_PUBLIC_DIR, "404.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 4rem; color: #333; margin-bottom: 1rem; }
    p { color: #666; margin-bottom: 2rem; }
    a { color: #E31837; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to Home</a>
  </div>
</body>
</html>`,
    "utf8"
  );

  logStep("static", "✔ Hosting files created");
}

/* =========================================================
   MAIN EXPORT
========================================================= */

export async function exportStaticSite(input = {}) {
  await ensureBaseOutputStructure();

  const crawl = await readJson(ARTIFACTS.crawlResults);
  const assets = await readJson(ARTIFACTS.assetManifest);

  await fs.emptyDir(STATIC_PUBLIC_DIR);

  const { assetLookup, copied } = await copyAssets(assets);

  const pages = crawl.pages || [];
  const exported = [];
  let successCount = 0;
  let errorCount = 0;

  for (const page of pages) {
    const pageUrl = page.normalizedUrl || page.url;
    
    try {
      const file = toPageOutputPath(pageUrl);
      const html = await rewritePageHtml(page, assetLookup, pageUrl);

      await fs.ensureDir(path.dirname(file));
      await fs.writeFile(file, html, "utf8");

      exported.push({ url: pageUrl, file });
      successCount++;
      
      if (successCount % 20 === 0) {
        logStep("static", `Exported ${successCount}/${pages.length} pages...`);
      }
    } catch (err) {
      errorCount++;
      logStep("static", `Error exporting ${pageUrl}: ${err.message}`);
    }
  }

  await writeHostingFiles();

  const manifest = {
    createdAt: new Date().toISOString(),
    totalPages: exported.length,
    copiedAssets: copied.length,
    successCount,
    errorCount,
    pages: exported
  };

  await writeJson(ARTIFACTS.staticManifest, manifest);

  await fs.writeJson(
    path.join(STATIC_PUBLIC_DIR, "export-manifest.json"),
    manifest,
    { spaces: 2 }
  );

  logStep("static", `✔ Export complete: ${successCount} pages, ${copied.length} assets`);

  return manifest;
}

export async function run() {
  return exportStaticSite();
}

if (process.argv[1]?.endsWith("export-static-site.js")) {
  run().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
