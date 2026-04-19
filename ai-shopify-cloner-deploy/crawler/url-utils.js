const TRACKING_PARAM_PATTERNS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^mc_/i,
  /^ref$/i,
  /^ref_$/i,
  /^referrer$/i,
  /^source$/i,
  /^srsltid$/i,
  /^variant$/i,
  /^pr_/i,
  /^_pos$/i,
  /^_psq$/i,
  /^_ss/i,
  /^_v$/i,
  /^sort_by$/i,
  /^filter/i,
  /^grid_list$/i,
  /^view$/i
];

const CONTENT_QUERY_WHITELIST = new Set([
  "page",
  "p",
  "id"
]);

const ASSET_EXTENSION_PATTERN =
  /\.(?:avif|bmp|css|csv|doc|docx|eot|gif|ico|jpeg|jpg|js|json|map|mov|mp3|mp4|m4v|ogg|otf|pdf|png|svg|tar|ttf|txt|wav|webm|webp|woff|woff2|xml|zip)$/i;

const IMAGE_ASSET_EXTENSION_PATTERN =
  /\.(?:avif|bmp|gif|ico|jpeg|jpg|png|svg|webp)$/i;

const IMAGE_TRANSFORM_QUERY_PARAMS = new Set([
  "width",
  "height",
  "crop",
  "quality",
  "format",
  "fit",
  "pad_color",
  "padcolor"
]);

const BLOCKED_PATH_SEGMENTS = [
  "/cart",
  "/checkout",
  "/account",
  "/customer",
  "/search",
  "/challenge",
  "/cdn-cgi",
  "/apps/",
  "/tools/",
  "/api/",
  "/graphql",
  "/admin"
];

export function absolutizeUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return null;
  }
}

export function normalizeUrl(url, baseUrl) {
  try {
    const parsed = new URL(url, baseUrl);

    parsed.hash = "";
    parsed.username = "";
    parsed.password = "";

    for (const key of [...parsed.searchParams.keys()]) {
      const shouldDrop =
        TRACKING_PARAM_PATTERNS.some(pattern => pattern.test(key)) ||
        !CONTENT_QUERY_WHITELIST.has(key);

      if (shouldDrop) {
        parsed.searchParams.delete(key);
      }
    }

    parsed.searchParams.sort();

    if (
      (parsed.protocol === "https:" && parsed.port === "443") ||
      (parsed.protocol === "http:" && parsed.port === "80")
    ) {
      parsed.port = "";
    }

    parsed.pathname = parsed.pathname.replace(/\/{2,}/g, "/");

    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeAssetUrl(url, baseUrl) {
  try {
    const parsed = new URL(url, baseUrl);
    parsed.hash = "";
    parsed.username = "";
    parsed.password = "";

    parsed.pathname = parsed.pathname.replace(/\/{2,}/g, "/");

    if (isImageAssetPath(parsed.pathname)) {
      for (const key of [...parsed.searchParams.keys()]) {
        if (IMAGE_TRANSFORM_QUERY_PARAMS.has(key.toLowerCase())) {
          parsed.searchParams.delete(key);
        }
      }
    }

    parsed.searchParams.sort();

    if (
      (parsed.protocol === "https:" && parsed.port === "443") ||
      (parsed.protocol === "http:" && parsed.port === "80")
    ) {
      parsed.port = "";
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function isImageAssetPath(pathname = "") {
  return IMAGE_ASSET_EXTENSION_PATTERN.test(pathname);
}

export function isAssetUrl(url) {
  if (!url) {
    return false;
  }

  return ASSET_EXTENSION_PATTERN.test(url);
}

export function isSameSiteUrl(url, startUrl) {
  try {
    const current = new URL(url);
    const target = new URL(startUrl);
    return current.hostname === target.hostname;
  } catch {
    return false;
  }
}

export function isCrawlablePageUrl(url, startUrl) {
  try {
    const parsed = new URL(url);

    if (!/^https?:$/i.test(parsed.protocol)) {
      return false;
    }

    if (!isSameSiteUrl(parsed.toString(), startUrl)) {
      return false;
    }

    if (isAssetUrl(parsed.pathname)) {
      return false;
    }

    if (
      BLOCKED_PATH_SEGMENTS.some(segment =>
        parsed.pathname.toLowerCase().startsWith(segment)
      )
    ) {
      return false;
    }

    if (
      parsed.pathname.toLowerCase().endsWith(".xml") ||
      parsed.pathname.toLowerCase().endsWith(".txt")
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function inferPageTypeFromUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();

    if (pathname === "/" || pathname === "") return "homepage";
    if (pathname.includes("/products/")) return "product";
    if (pathname.includes("/collections/")) return "collection";
    if (pathname.includes("/blogs/") || pathname.includes("/articles/")) {
      return "article";
    }
    if (
      pathname.includes("/pages/") ||
      pathname.includes("/about") ||
      pathname.includes("/contact") ||
      pathname.includes("/faq")
    ) {
      return "content";
    }
    if (
      pathname.includes("/policy") ||
      pathname.includes("/terms") ||
      pathname.includes("/privacy") ||
      pathname.includes("/refund") ||
      pathname.includes("/shipping")
    ) {
      return "policy";
    }

    return "generic";
  } catch {
    return "generic";
  }
}

export function dedupeUrls(urls = [], normalizer = normalizeUrl) {
  const seen = new Set();
  const results = [];

  for (const url of urls) {
    const normalized = normalizer(url);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    results.push(normalized);
  }

  return results;
}
