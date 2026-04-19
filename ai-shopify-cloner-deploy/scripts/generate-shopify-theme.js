import path from "path";
import fs from "fs-extra";
import * as cheerio from "cheerio";
import {
  ARTIFACTS,
  THEME_DIR,
  escapeHtml,
  logStep,
  readJson,
  writeJson,
} from "./pipeline-utils.js";

function uniq(values = []) {
  return [...new Set((values || []).filter(Boolean))];
}

async function ensureThemeDirs() {
  for (const dir of [
    "layout",
    "templates",
    "sections",
    "snippets",
    "assets",
    "config",
    "locales",
  ]) {
    await fs.ensureDir(path.join(THEME_DIR, dir));
  }
}

async function loadInputs(input = {}) {
  const crawlResults =
    input.crawlResults || (await readJson(ARTIFACTS.crawlResults, "crawl results"));

  return {
    siteMap: input.siteMap || (await readJson(ARTIFACTS.siteMap, "site map")),
    crawlResults,
    products: input.products || (await readJson(ARTIFACTS.products, "products")),
    pageClassification:
      input.pageClassification ||
      (await readJson(ARTIFACTS.pageClassification, "page classification")),
    assetManifest:
      input.assetManifest || (await readJson(ARTIFACTS.assetManifest, "asset manifest")),
  };
}

function getPageByType(type, crawlResults, pageClassification) {
  const classified = (pageClassification?.pages || []).find(item => item.type === type);
  if (!classified) return null;

  return (
    (crawlResults?.pages || []).find(
      page => (page.normalizedUrl || page.url) === classified.url
    ) || null
  );
}

function getHomepage(crawlResults, pageClassification) {
  return (
    getPageByType("homepage", crawlResults, pageClassification) ||
    (crawlResults?.pages || []).find(page => {
      try {
        return new URL(page.normalizedUrl || page.url).pathname === "/";
      } catch {
        return false;
      }
    }) ||
    crawlResults?.pages?.[0] ||
    null
  );
}

function deriveSiteName(homepage) {
  const title = homepage?.title || "Cloned Shopify Theme";
  return (
    title
      .split(/[\-|–|•]/)
      .map(part => part.trim())
      .find(Boolean) || title
  );
}

function toLocalPath(url) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || "/";
    return parsed.search ? `${pathname}${parsed.search}` : pathname;
  } catch {
    return url || "#";
  }
}

function buildAssetMaps(assetManifest) {
  const downloadedAssets = (assetManifest?.assets || []).filter(
    asset => asset?.downloaded && asset?.localPath
  );

  const byRemoteUrl = new Map();
  const cssAssets = [];
  const jsAssets = [];
  const copiedAssets = [];

  for (const asset of downloadedAssets) {
    const themeAssetName = asset.themeAssetName || asset.fileName;
    byRemoteUrl.set(asset.normalizedUrl, themeAssetName);
    copiedAssets.push({
      ...asset,
      themeAssetName,
    });

    if (asset.type === "css") cssAssets.push(themeAssetName);
    if (asset.type === "js") jsAssets.push(themeAssetName);
  }

  return {
    copiedAssets,
    byRemoteUrl,
    cssAssets: uniq(cssAssets),
    jsAssets: uniq(jsAssets),
  };
}

async function copyThemeAssets(assetManifest) {
  const maps = buildAssetMaps(assetManifest);

  for (const asset of maps.copiedAssets) {
    const destination = path.join(THEME_DIR, "assets", asset.themeAssetName);
    await fs.copy(asset.localPath, destination, { overwrite: true });
  }

  return maps;
}

function liquidAssetTag(assetName, kind = "asset_url") {
  if (!assetName) return "";
  return `{{ '${assetName}' | ${kind} }}`;
}

function rewriteStyleUrls(styleValue, assetMap) {
  if (!styleValue) return styleValue;

  return styleValue.replace(/url\((['"]?)(.*?)\1\)/g, (_full, _quote, rawUrl) => {
    const trimmed = String(rawUrl || "").trim();
    const assetName = assetMap.get(trimmed);
    if (!assetName) return `url(${trimmed})`;
    return `url(${liquidAssetTag(assetName)})`;
  });
}

function normalizeAppShell($node) {
  const existingClass = $node.attr("class") || "";
  $node.attr("class", `${existingClass} clone-app-shell`.trim());

  if (!$node.attr("data-clone-app-shell")) {
    $node.attr("data-clone-app-shell", "true");
  }

  if (!$node.text().trim()) {
    $node.append('<div class="clone-app-shell__placeholder"></div>');
  }
}

function sanitizeAndRewriteHtml(html, assetMap, pageUrl = "") {
  if (!html) return "";

  const $ = cheerio.load(html, {
    decodeEntities: false,
    xmlMode: false,
  });

  $("script").each((_index, node) => {
    const $node = $(node);
    const type = ($node.attr("type") || "").toLowerCase();
    const src = $node.attr("src") || "";

    if (type === "application/ld+json" || type === "application/json") {
      return;
    }

    if (/shopify|cdn\.shopify|theme\.js/i.test(src)) {
      $node.remove();
      return;
    }

    if (/yotpo|fastbundle|judge|klaviyo|swym|restock|countdown|reviews|subscription/i.test(src)) {
      $node.replaceWith(
        `<div class="clone-app-shell clone-app-script-shell" data-clone-script="${escapeHtml(
          src
        )}"></div>`
      );
      return;
    }

    $node.remove();
  });

  $("link").each((_index, node) => {
    const $node = $(node);
    const rel = ($node.attr("rel") || "").toLowerCase();
    const href = $node.attr("href") || "";
    const assetName = assetMap.get(href);

    if (rel.includes("stylesheet") || rel.includes("preload") || rel.includes("modulepreload")) {
      $node.remove();
      return;
    }

    if (assetName && rel.includes("icon")) {
      $node.attr("href", liquidAssetTag(assetName));
      return;
    }

    if (/canonical|alternate|preconnect|dns-prefetch/i.test(rel)) {
      $node.remove();
    }
  });

  $("[src]").each((_index, node) => {
    const $node = $(node);
    const src = $node.attr("src");
    const assetName = assetMap.get(src);
    if (assetName) {
      $node.attr("src", liquidAssetTag(assetName));
    }
  });

  $("[poster]").each((_index, node) => {
    const $node = $(node);
    const poster = $node.attr("poster");
    const assetName = assetMap.get(poster);
    if (assetName) {
      $node.attr("poster", liquidAssetTag(assetName));
    }
  });

  $("[srcset]").each((_index, node) => {
    const $node = $(node);
    const raw = $node.attr("srcset") || "";
    const rewritten = raw
      .split(",")
      .map(part => {
        const [candidate, descriptor] = part.trim().split(/\s+/, 2);
        const assetName = assetMap.get(candidate);
        const nextUrl = assetName ? liquidAssetTag(assetName) : candidate;
        return descriptor ? `${nextUrl} ${descriptor}` : nextUrl;
      })
      .join(", ");
    if (rewritten) {
      $node.attr("srcset", rewritten);
    }
  });

  $("[data-src]").each((_index, node) => {
    const $node = $(node);
    const raw = $node.attr("data-src");
    const assetName = assetMap.get(raw);
    if (assetName) {
      $node.attr("data-src", liquidAssetTag(assetName));
    }
  });

  $("[data-srcset]").each((_index, node) => {
    const $node = $(node);
    const raw = $node.attr("data-srcset") || "";
    const rewritten = raw
      .split(",")
      .map(part => {
        const [candidate, descriptor] = part.trim().split(/\s+/, 2);
        const assetName = assetMap.get(candidate);
        const nextUrl = assetName ? liquidAssetTag(assetName) : candidate;
        return descriptor ? `${nextUrl} ${descriptor}` : nextUrl;
      })
      .join(", ");
    if (rewritten) {
      $node.attr("data-srcset", rewritten);
    }
  });

  $("[style]").each((_index, node) => {
    const $node = $(node);
    $node.attr("style", rewriteStyleUrls($node.attr("style") || "", assetMap));
  });

  $("a[href]").each((_index, node) => {
    const $node = $(node);
    const href = $node.attr("href") || "";
    if (/^https?:\/\//i.test(href)) {
      $node.attr("href", toLocalPath(href));
    }
  });

  $("form[action]").each((_index, node) => {
    const $node = $(node);
    const action = $node.attr("action") || "";
    if (/^https?:\/\//i.test(action)) {
      $node.attr("action", toLocalPath(action));
    }
  });

  $(
    [
      "[class*='yotpo']",
      "[id*='yotpo']",
      "[class*='fastbundle']",
      "[id*='fastbundle']",
      "[class*='judge']",
      "[id*='judge']",
      "[class*='subscription']",
      "[id*='subscription']",
      "[class*='restock']",
      "[id*='restock']",
      "[class*='countdown']",
      "[id*='countdown']",
      "[data-widget]",
      "[data-reviews]",
    ].join(",")
  ).each((_index, node) => normalizeAppShell($(node)));

  if (pageUrl) {
    $("body").attr("data-clone-source-url", pageUrl);
  }

  return $.root().html() || "";
}

function pickRepresentativeBlocks(page) {
  if (page?.dom?.mainBlocks?.length) {
    return page.dom.mainBlocks.map(block => block.html).filter(Boolean);
  }

  if (!page?.html) return [];
  const $ = cheerio.load(page.html, { decodeEntities: false });
  const mainChildren = $("main").first().children().toArray();
  if (mainChildren.length) {
    return mainChildren.map(node => $.html(node)).filter(Boolean);
  }

  const bodyChildren = $("body").first().children().toArray();
  return bodyChildren
    .filter(node => !["script", "noscript", "header", "footer"].includes(node.tagName))
    .map(node => $.html(node))
    .filter(Boolean);
}

function createSectionFileContent(name, html) {
  const schema = {
    name,
    settings: [],
    presets: [{ name }],
  };

  return `${html}

{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`;
}

function buildTemplateJson(sectionTypes) {
  const sections = {};
  const order = [];

  sectionTypes.forEach((type, index) => {
    const key = `section_${index + 1}`;
    sections[key] = { type };
    order.push(key);
  });

  return {
    sections,
    order,
  };
}

async function writeSection(fileName, title, html) {
  await fs.writeFile(
    path.join(THEME_DIR, "sections", `${fileName}.liquid`),
    createSectionFileContent(title, html)
  );
}

async function writeDomSections(prefix, blocks, assetMap, pageUrl) {
  const sectionTypes = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const blockHtml = sanitizeAndRewriteHtml(blocks[index], assetMap, pageUrl);

    if (!cleanVisibleMarkup(blockHtml)) continue;

    const type = `${prefix}-${index + 1}`;
    sectionTypes.push(type);

    await writeSection(type, `DOM Block ${index + 1}`, blockHtml);
  }

  return sectionTypes;
}

function cleanVisibleMarkup(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function writeJsonTemplate(name, sectionTypes) {
  await fs.writeJson(
    path.join(THEME_DIR, "templates", `${name}.json`),
    buildTemplateJson(sectionTypes),
    { spaces: 2 }
  );
}

async function writeLiquidTemplate(name, content) {
  await fs.writeFile(path.join(THEME_DIR, "templates", `${name}.liquid`), content);
}

async function writeLegacyTemplate(name) {
  await fs.writeFile(
    path.join(THEME_DIR, "templates", `${name}.liquid`),
    `{% section 'header' %}\n{{ content_for_layout }}\n{% section 'footer' %}\n`
  );
}

function renderNativeProductSection() {
  return `
<section class="clone-native-product-form">
  <div class="clone-native-product-form__inner">
    <h1>{{ product.title }}</h1>
    <div class="clone-native-product-form__price">{{ product.price | money }}</div>
    {% form 'product', product %}
      {% unless product.has_only_default_variant %}
        <select name="id">
          {% for variant in product.variants %}
            <option value="{{ variant.id }}">{{ variant.title }}</option>
          {% endfor %}
        </select>
      {% else %}
        <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
      {% endunless %}
      <button type="submit">Add to cart</button>
    {% endform %}
    <div class="clone-native-product-form__description">{{ product.description }}</div>
  </div>
</section>

{% schema %}
{
  "name": "Native Product Form",
  "settings": []
}
{% endschema %}
`;
}

function renderNativeCollectionSection() {
  return `
<section class="clone-native-collection-grid">
  <div class="clone-native-collection-grid__inner">
    <h1>{{ collection.title }}</h1>
    <div class="clone-native-collection-grid__items">
      {% for product in collection.products %}
        <article class="clone-native-collection-grid__card">
          <a href="{{ product.url }}">
            {% if product.featured_image %}
              {{ product.featured_image | image_url: width: 900 | image_tag: loading: 'lazy', widths: '400,700,900' }}
            {% endif %}
            <h3>{{ product.title }}</h3>
            <div>{{ product.price | money }}</div>
          </a>
        </article>
      {% endfor %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Native Collection Grid",
  "settings": []
}
{% endschema %}
`;
}

function renderThemeBaseCss() {
  return `
html { scroll-behavior: smooth; }
body { margin: 0; }
img, video, iframe { max-width: 100%; }
.clone-app-shell {
  min-height: 40px;
  position: relative;
}
.clone-app-shell__placeholder {
  min-height: 40px;
}
.clone-native-product-form,
.clone-native-collection-grid {
  padding: 24px 16px;
}
.clone-native-product-form__inner,
.clone-native-collection-grid__inner {
  max-width: 1280px;
  margin: 0 auto;
}
.clone-native-collection-grid__items {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}
.clone-native-collection-grid__card a {
  color: inherit;
  text-decoration: none;
}
@media (max-width: 990px) {
  .clone-native-collection-grid__items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .clone-native-collection-grid__items {
    grid-template-columns: 1fr;
  }
}
`;
}

function renderThemeRuntimeJs() {
  return `
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header, [role='banner']");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("clone-is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.querySelectorAll(".clone-app-shell iframe, .clone-app-shell script").forEach(node => {
    node.remove();
  });
});
`;
}

function renderThemeCss() {
  return `
@import url("{{ 'theme-base.css' | asset_url }}");
`;
}

function buildThemeLiquid({ siteName, cssAssets, jsAssets }) {
  const cssIncludes = cssAssets
    .map(asset => `  {{ '${asset}' | asset_url | stylesheet_tag }}`)
    .join("\n");

  const jsIncludes = jsAssets
    .map(asset => `  <script src="{{ '${asset}' | asset_url }}" defer></script>`)
    .join("\n");

  return `<!doctype html>
<html lang="{{ request.locale.iso_code | default: 'en' }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{ page_title }}{% unless page_title contains "${escapeHtml(
      siteName
    )}" %} - ${escapeHtml(siteName)}{% endunless %}</title>
    {{ content_for_header }}
    {{ 'theme.css' | asset_url | stylesheet_tag }}
${cssIncludes}
  </head>
  <body>
    {% section 'header' %}
    <main id="MainContent" role="main">
      {{ content_for_layout }}
    </main>
    {% section 'footer' %}
    <script src="{{ 'theme-runtime.js' | asset_url }}" defer></script>
${jsIncludes}
  </body>
</html>
`;
}

function buildHeaderHtml(homepage, assetMap, siteName) {
  const fallback = `<header class="clone-header"><div class="clone-header__inner">${escapeHtml(
    siteName
  )}</div></header>`;
  return sanitizeAndRewriteHtml(homepage?.dom?.headerHtml || fallback, assetMap, homepage?.url);
}

function buildFooterHtml(homepage, assetMap, siteName) {
  const fallback = `<footer class="clone-footer"><div class="clone-footer__inner">${escapeHtml(
    siteName
  )}</div></footer>`;
  return sanitizeAndRewriteHtml(homepage?.dom?.footerHtml || fallback, assetMap, homepage?.url);
}

export async function generateTheme(input = {}) {
  const { crawlResults, pageClassification, assetManifest } = await loadInputs(input);

  await fs.emptyDir(THEME_DIR);
  await ensureThemeDirs();

  const homepage = getHomepage(crawlResults, pageClassification);
  const productPage = getPageByType("product", crawlResults, pageClassification);
  const collectionPage = getPageByType("collection", crawlResults, pageClassification);
  const genericPage = getPageByType("page", crawlResults, pageClassification);
  const siteName = deriveSiteName(homepage);

  const { byRemoteUrl, cssAssets, jsAssets, copiedAssets } = await copyThemeAssets(assetManifest);

  await fs.writeFile(path.join(THEME_DIR, "assets", "theme-base.css"), renderThemeBaseCss());
  await fs.writeFile(path.join(THEME_DIR, "assets", "theme.css"), renderThemeCss());
  await fs.writeFile(path.join(THEME_DIR, "assets", "theme-runtime.js"), renderThemeRuntimeJs());

  await writeSection(
    "header",
    "Header",
    buildHeaderHtml(homepage, byRemoteUrl, siteName)
  );

  await writeSection(
    "footer",
    "Footer",
    buildFooterHtml(homepage, byRemoteUrl, siteName)
  );

  const homeBlocks = pickRepresentativeBlocks(homepage);
  const productBlocks = pickRepresentativeBlocks(productPage || homepage);
  const collectionBlocks = pickRepresentativeBlocks(collectionPage || homepage);
  const pageBlocks = pickRepresentativeBlocks(genericPage || homepage);

  const homeSectionTypes = await writeDomSections(
    "home-dom",
    homeBlocks,
    byRemoteUrl,
    homepage?.url || ""
  );

  const productSectionTypes = await writeDomSections(
    "product-dom",
    productBlocks,
    byRemoteUrl,
    productPage?.url || homepage?.url || ""
  );

  const collectionSectionTypes = await writeDomSections(
    "collection-dom",
    collectionBlocks,
    byRemoteUrl,
    collectionPage?.url || homepage?.url || ""
  );

  const pageSectionTypes = await writeDomSections(
    "page-dom",
    pageBlocks,
    byRemoteUrl,
    genericPage?.url || homepage?.url || ""
  );

  if (!(productPage?.forms || []).some(form => form.hasProductInput)) {
    await fs.writeFile(
      path.join(THEME_DIR, "sections", "native-product-form.liquid"),
      renderNativeProductSection()
    );
    productSectionTypes.push("native-product-form");
  }

  if (!(collectionPage?.collectionCards || []).length) {
    await fs.writeFile(
      path.join(THEME_DIR, "sections", "native-collection-grid.liquid"),
      renderNativeCollectionSection()
    );
    collectionSectionTypes.push("native-collection-grid");
  }

  await fs.writeFile(
    path.join(THEME_DIR, "layout", "theme.liquid"),
    buildThemeLiquid({
      siteName,
      cssAssets,
      jsAssets,
    })
  );

  await writeJsonTemplate("index", homeSectionTypes.length ? homeSectionTypes : ["header"]);
  await writeJsonTemplate(
    "product",
    productSectionTypes.length ? productSectionTypes : homeSectionTypes
  );
  await writeJsonTemplate(
    "collection",
    collectionSectionTypes.length ? collectionSectionTypes : homeSectionTypes
  );
  await writeJsonTemplate(
    "page",
    pageSectionTypes.length ? pageSectionTypes : homeSectionTypes
  );

  await writeLegacyTemplate("index");
  await writeLegacyTemplate("product");
  await writeLegacyTemplate("collection");
  await writeLegacyTemplate("page");

  await writeLiquidTemplate(
    "404",
    `<section class="clone-404"><div class="page-width"><h1>Page not found</h1></div></section>`
  );

  await fs.writeJson(
    path.join(THEME_DIR, "config", "settings_schema.json"),
    [
      {
        name: "Theme information",
        settings: [
          {
            type: "paragraph",
            content:
              "This theme was generated from a crawled storefront with DOM-preserving sections."
          }
        ]
      }
    ],
    { spaces: 2 }
  );

  await fs.writeJson(
    path.join(THEME_DIR, "config", "settings_data.json"),
    {
      current: {}
    },
    { spaces: 2 }
  );

  await fs.writeJson(
    path.join(THEME_DIR, "locales", "en.default.json"),
    {
      general: {
        accessibility: {
          skip_to_content: "Skip to content"
        }
      }
    },
    { spaces: 2 }
  );

  const themeData = {
    generatedAt: new Date().toISOString(),
    siteName,
    copiedAssetCount: copiedAssets.length,
    cssAssets,
    jsAssets,
    templates: ["index", "product", "collection", "page", "404"],
    homepage: homepage?.normalizedUrl || homepage?.url || "",
    productPage: productPage?.normalizedUrl || productPage?.url || "",
    collectionPage: collectionPage?.normalizedUrl || collectionPage?.url || "",
  };

  await writeJson(ARTIFACTS.themeData, themeData);
  logStep("theme", `Generated DOM-preserving Shopify theme for ${siteName}`);

  return themeData;
}

export async function run() {
  return generateTheme();
}

if (process.argv[1]?.endsWith("generate-shopify-theme.js")) {
  run().catch(error => {
    console.error(`[theme] Generation failed: ${error.message}`);
    process.exit(1);
  });
}