import axios from "axios";
import { chromium } from "playwright";

import {
  absolutizeUrl,
  inferPageTypeFromUrl,
  isCrawlablePageUrl,
  normalizeAssetUrl,
  normalizeUrl
} from "./url-utils.js";

const DEFAULT_MAX_PAGES = Number(process.env.CLONER_MAX_MAP_PAGES || 600);
const DEFAULT_TIMEOUT_MS = Number(process.env.CLONER_NAV_TIMEOUT_MS || 45000);
const SENSITIVE_META_PATTERN =
  /(token|secret|authorization|api[-_]?key|wallet)/i;

function extractMetaMap(documentMeta = []) {
  const meta = {};

  for (const item of documentMeta) {
    const key = item.name || item.property || item.httpEquiv;

    if (!key || !item.content) {
      continue;
    }

    meta[key] = SENSITIVE_META_PATTERN.test(key)
      ? "[redacted]"
      : item.content;
  }

  return meta;
}

function extractXmlLocs(xml = "") {
  const locations = [];
  const matches = xml.matchAll(/<loc>(.*?)<\/loc>/gi);

  for (const match of matches) {
    if (match[1]) {
      locations.push(match[1].trim());
    }
  }

  return locations;
}

async function fetchText(url, timeout) {
  try {
    const response = await axios.get(url, {
      timeout,
      responseType: "text",
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
      }
    });

    return response.data;
  } catch {
    return null;
  }
}

async function discoverSitemapEntries(startUrl, timeout) {
  const base = new URL(startUrl);
  const candidateSitemaps = new Set([
    absolutizeUrl("/sitemap.xml", base),
    absolutizeUrl("/sitemap_index.xml", base)
  ]);

  const robotsUrl = absolutizeUrl("/robots.txt", base);
  const robotsText = await fetchText(robotsUrl, timeout);

  if (robotsText) {
    for (const line of robotsText.split(/\r?\n/)) {
      const match = line.match(/^sitemap:\s*(.+)$/i);

      if (match?.[1]) {
        candidateSitemaps.add(match[1].trim());
      }
    }
  }

  const discoveredPages = [];
  const seenSitemaps = new Set();
  const queue = [...candidateSitemaps].filter(Boolean).slice(0, 6);

  while (queue.length) {
    const sitemapUrl = queue.shift();

    if (!sitemapUrl || seenSitemaps.has(sitemapUrl)) {
      continue;
    }

    seenSitemaps.add(sitemapUrl);

    const xml = await fetchText(sitemapUrl, timeout);

    if (!xml) {
      continue;
    }

    const locs = extractXmlLocs(xml);

    for (const loc of locs) {
      if (loc.endsWith(".xml")) {
        if (!seenSitemaps.has(loc) && queue.length < 20) {
          queue.push(loc);
        }

        continue;
      }

      const normalized = normalizeUrl(loc, startUrl);

      if (normalized && isCrawlablePageUrl(normalized, startUrl)) {
        discoveredPages.push(normalized);
      }
    }
  }

  return [...new Set(discoveredPages)];
}

function dedupeAssets(assetRefs = {}) {
  const dedupe = values =>
    [...new Set((values || []).filter(Boolean))];

  return {
    images: dedupe(assetRefs.images),
    styles: dedupe(assetRefs.styles),
    scripts: dedupe(assetRefs.scripts),
    fonts: dedupe(assetRefs.fonts),
    videos: dedupe(assetRefs.videos),
    icons: dedupe(assetRefs.icons)
  };
}

function inferTypeHint(pageUrl, meta, linkedPages = []) {
  const urlHint = inferPageTypeFromUrl(pageUrl);

  if (urlHint !== "generic") {
    return urlHint;
  }

  const metaText = Object.values(meta || {})
    .join(" ")
    .toLowerCase();

  if (metaText.includes("product")) return "product";
  if (metaText.includes("collection")) return "collection";
  if (metaText.includes("policy")) return "policy";

  const productLinks = linkedPages.filter(link =>
    link.url?.includes("/products/")
  );
  const collectionLinks = linkedPages.filter(link =>
    link.url?.includes("/collections/")
  );

  if (productLinks.length >= 3) return "catalog";
  if (collectionLinks.length >= 3) return "collection";

  return "generic";
}

export async function mapSite(startUrl, options = {}) {
  const maxPages = options.maxPages || DEFAULT_MAX_PAGES;
  const timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  const normalizedStartUrl = normalizeUrl(startUrl);

  if (!normalizedStartUrl) {
    throw new Error(`Invalid start URL: ${startUrl}`);
  }

  console.log("[map] Starting site discovery");
  console.log(`[map] Target: ${normalizedStartUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
  });
  const page = await context.newPage();

  const visited = new Set();
  const queued = new Set();
  const pages = [];
  const failures = [];
  const queue = [];

  const enqueue = candidate => {
    const normalized = normalizeUrl(candidate.url, normalizedStartUrl);

    if (
      !normalized ||
      visited.has(normalized) ||
      queued.has(normalized) ||
      !isCrawlablePageUrl(normalized, normalizedStartUrl)
    ) {
      return;
    }

    queued.add(normalized);
    queue.push({
      ...candidate,
      url: normalized
    });
  };

  enqueue({
    url: normalizedStartUrl,
    depth: 0,
    source: "entrypoint",
    discoveredFrom: null,
    linkText: "Homepage"
  });

  const sitemapPages = await discoverSitemapEntries(normalizedStartUrl, timeout);

  for (const sitemapUrl of sitemapPages) {
    enqueue({
      url: sitemapUrl,
      depth: 1,
      source: "sitemap",
      discoveredFrom: normalizedStartUrl,
      linkText: ""
    });
  }

  while (queue.length && pages.length < maxPages) {
    const current = queue.shift();

    if (!current?.url) {
      continue;
    }

    queued.delete(current.url);

    if (visited.has(current.url)) {
      continue;
    }

    visited.add(current.url);

    console.log(
      `[map] (${pages.length + 1}/${maxPages}) Visiting ${current.url}`
    );

    try {
      await page.goto(current.url, {
        waitUntil: "domcontentloaded",
        timeout
      });

      await page.waitForTimeout(800);

      const extracted = await page.evaluate(() => {
        const asArray = iterable => Array.from(iterable || []);
        const uniq = values => [...new Set(values.filter(Boolean))];
        const getText = value => value?.replace(/\s+/g, " ").trim() || "";

        return {
          finalUrl: location.href,
          title: document.title || "",
          canonicalUrl:
            document.querySelector("link[rel='canonical']")?.href || "",
          meta: asArray(document.querySelectorAll("meta")).map(node => ({
            name: node.getAttribute("name"),
            property: node.getAttribute("property"),
            httpEquiv: node.getAttribute("http-equiv"),
            content: node.getAttribute("content")
          })),
          linkedPages: asArray(document.querySelectorAll("a[href]")).map(
            anchor => ({
              url: anchor.href,
              text: getText(anchor.textContent),
              rel: anchor.getAttribute("rel") || "",
              ariaLabel: anchor.getAttribute("aria-label") || ""
            })
          ),
          assetRefs: {
            images: uniq(
              asArray(document.querySelectorAll("img[src], source[srcset]"))
                .flatMap(node => {
                  const src = node.getAttribute("src");
                  const srcset = node.getAttribute("srcset");
                  return [src, ...(srcset ? srcset.split(",") : [])]
                    .map(value => value?.trim().split(/\s+/)[0])
                    .filter(Boolean)
                    .map(value => new URL(value, location.href).toString());
                })
            ),
            styles: uniq(
              asArray(
                document.querySelectorAll(
                  "link[rel='stylesheet'][href], link[as='style'][href]"
                )
              ).map(node => node.href)
            ),
            scripts: uniq(
              asArray(document.querySelectorAll("script[src]")).map(
                node => node.src
              )
            ),
            fonts: uniq(
              asArray(
                document.querySelectorAll(
                  "link[rel='preload'][href][as='font'], link[href*='font']"
                )
              ).map(node => node.href)
            ),
            videos: uniq(
              asArray(document.querySelectorAll("video[src], video source[src]"))
                .map(node => node.src)
                .filter(Boolean)
            ),
            icons: uniq(
              asArray(document.querySelectorAll("link[rel*='icon'][href]")).map(
                node => node.href
              )
            )
          }
        };
      });

      const meta = extractMetaMap(extracted.meta);
      const finalUrl =
        normalizeUrl(extracted.canonicalUrl || extracted.finalUrl, startUrl) ||
        current.url;

      const linkedPages = extracted.linkedPages
        .map(link => ({
          url: normalizeUrl(link.url, finalUrl),
          text: link.text,
          rel: link.rel,
          ariaLabel: link.ariaLabel
        }))
        .filter(link => link.url && isCrawlablePageUrl(link.url, finalUrl));

      const assetRefs = dedupeAssets({
        images: extracted.assetRefs.images.map(url =>
          normalizeAssetUrl(url, finalUrl)
        ),
        styles: extracted.assetRefs.styles.map(url =>
          normalizeAssetUrl(url, finalUrl)
        ),
        scripts: extracted.assetRefs.scripts.map(url =>
          normalizeAssetUrl(url, finalUrl)
        ),
        fonts: extracted.assetRefs.fonts.map(url =>
          normalizeAssetUrl(url, finalUrl)
        ),
        videos: extracted.assetRefs.videos.map(url =>
          normalizeAssetUrl(url, finalUrl)
        ),
        icons: extracted.assetRefs.icons.map(url =>
          normalizeAssetUrl(url, finalUrl)
        )
      });

      const record = {
        url: finalUrl,
        normalizedUrl: finalUrl,
        path: new URL(finalUrl).pathname || "/",
        depth: current.depth,
        source: current.source,
        discoveredFrom: current.discoveredFrom,
        linkText: current.linkText || "",
        title: extracted.title,
        canonicalUrl: extracted.canonicalUrl || "",
        meta,
        typeHint: inferTypeHint(finalUrl, meta, linkedPages),
        linkedPages,
        assetRefs
      };

      pages.push(record);

      for (const link of linkedPages) {
        enqueue({
          url: link.url,
          depth: current.depth + 1,
          source: "page-link",
          discoveredFrom: record.normalizedUrl,
          linkText: link.text || link.ariaLabel || ""
        });
      }
    } catch (error) {
      failures.push({
        url: current.url,
        message: error.message
      });
      console.log(`[map] Failed: ${current.url} (${error.message})`);
    }
  }

  await context.close();
  await browser.close();

  const result = {
    startUrl: normalizedStartUrl,
    totalPages: pages.length,
    pages,
    failures,
    discoveredAt: new Date().toISOString(),
    plan: {
      tier: "standard",
      pageLimit: maxPages,
      upgradeMessage:
        "This website exceeds the Standard plan limit of 600 pages. Upgrade to PRO to crawl more than 600 pages."
    },
    stats: {
      visited: visited.size,
      queuedRemaining: queue.length,
      sitemapSeedCount: sitemapPages.length,
      failureCount: failures.length
    },
    limit: {
      reached: pages.length >= maxPages,
      requiresProUpgrade: pages.length >= maxPages && queue.length > 0,
      discoveredOverflowPages: queue.length
    }
  };

  console.log(`[map] Completed with ${pages.length} pages`);

  return result;
}
