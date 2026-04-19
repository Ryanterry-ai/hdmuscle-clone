import path from "path";

import { normalizeAssetUrl } from "../crawler/url-utils.js";
import {
  sanitizeFilename,
  stableHash,
  withExtension
} from "./pipeline-utils.js";

export const ASSET_FOLDERS = {
  image: "images",
  svg: "svg",
  css: "css",
  js: "js",
  font: "fonts",
  media: "media",
  other: "misc"
};

const MIME_TO_EXTENSION = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["text/css", ".css"],
  ["application/javascript", ".js"],
  ["text/javascript", ".js"],
  ["font/woff", ".woff"],
  ["font/woff2", ".woff2"],
  ["font/ttf", ".ttf"],
  ["font/otf", ".otf"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["audio/mpeg", ".mp3"]
]);

export function extensionFromContentType(contentType = "") {
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  return MIME_TO_EXTENSION.get(normalized) || "";
}

export function detectAssetTypeFromUrl(url = "", contentType = "") {
  const pathname = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return String(url || "").toLowerCase();
    }
  })();

  const typeSource = `${pathname} ${contentType}`.toLowerCase();

  if (typeSource.includes(".css") || contentType.includes("text/css")) {
    return "css";
  }

  if (
    typeSource.includes(".js") ||
    contentType.includes("javascript") ||
    contentType.includes("ecmascript")
  ) {
    return "js";
  }

  if (
    /\.(woff2?|ttf|otf|eot)$/i.test(pathname) ||
    contentType.includes("font/")
  ) {
    return "font";
  }

  if (
    /\.(mp4|webm|mov|m4v|mp3|wav|ogg)$/i.test(pathname) ||
    contentType.includes("video/") ||
    contentType.includes("audio/")
  ) {
    return "media";
  }

  if (/\.svg$/i.test(pathname) || contentType.includes("svg")) {
    return "svg";
  }

  if (
    /\.(jpg|jpeg|png|gif|webp|avif|bmp|ico)$/i.test(pathname) ||
    contentType.includes("image/")
  ) {
    return "image";
  }

  return "other";
}

export function buildAssetRecord(url, context = {}) {
  const normalizedUrl = normalizeAssetUrl(url, context.baseUrl);

  if (
    !normalizedUrl ||
    normalizedUrl.startsWith("data:") ||
    normalizedUrl.startsWith("blob:")
  ) {
    return null;
  }

  const parsed = new URL(normalizedUrl);
  const rawExtension = path.extname(parsed.pathname);
  const inferredType = detectAssetTypeFromUrl(normalizedUrl, context.contentType);
  const extension =
    rawExtension ||
    extensionFromContentType(context.contentType) ||
    (inferredType === "css"
      ? ".css"
      : inferredType === "js"
        ? ".js"
        : inferredType === "font"
          ? ".woff2"
          : inferredType === "svg"
            ? ".svg"
            : inferredType === "media"
              ? ".mp4"
              : ".bin");

  const basename = path.basename(parsed.pathname, rawExtension) || inferredType;
  const safeBase = sanitizeFilename(basename || inferredType, inferredType);
  const hash = stableHash(normalizedUrl, 12);
  const folder = ASSET_FOLDERS[inferredType] || ASSET_FOLDERS.other;
  const fileName = withExtension(`${safeBase}-${hash}`, extension, ".bin");
  const themeAssetName = withExtension(
    `${folder}-${safeBase}-${hash}`,
    extension,
    ".bin"
  );

  return {
    url,
    normalizedUrl,
    type: inferredType,
    folder,
    extension: path.extname(fileName) || extension,
    fileName,
    localRelativePath: `${folder}/${fileName}`,
    themeAssetName,
    discoveredOnPages: uniq(
      [context.pageUrl, ...(context.discoveredOnPages || [])].filter(Boolean)
    ),
    sourceKinds: uniq(
      [context.sourceKind, ...(context.sourceKinds || [])].filter(Boolean)
    ),
    downloaded: false,
    status: "pending",
    size: 0,
    contentType: context.contentType || ""
  };
}

function uniq(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function collectAssetsFromCrawlResults(crawlData) {
  const pages = crawlData?.pages || [];
  const records = new Map();

  const addAsset = (url, context) => {
    const record = buildAssetRecord(url, context);

    if (!record) {
      return;
    }

    const existing = records.get(record.normalizedUrl);

    if (!existing) {
      records.set(record.normalizedUrl, record);
      return;
    }

    existing.discoveredOnPages = uniq([
      ...existing.discoveredOnPages,
      ...record.discoveredOnPages
    ]);
    existing.sourceKinds = uniq([...existing.sourceKinds, ...record.sourceKinds]);
  };

  for (const page of pages) {
    const assetGroups = [
      ["image", page.assets?.images],
      ["image", page.assets?.backgroundImages],
      ["svg", page.assets?.svgs],
      ["css", page.assets?.styles],
      ["js", page.assets?.scripts],
      ["font", page.assets?.fonts],
      ["media", page.assets?.videos],
      ["media", page.assets?.media],
      ["image", page.assets?.icons]
    ];

    for (const [sourceKind, values] of assetGroups) {
      for (const url of values || []) {
        addAsset(url, {
          pageUrl: page.normalizedUrl || page.url,
          baseUrl: page.normalizedUrl || page.url,
          sourceKind
        });
      }
    }
  }

  const assets = [...records.values()].sort((a, b) =>
    a.normalizedUrl.localeCompare(b.normalizedUrl)
  );

  return {
    createdAt: new Date().toISOString(),
    totalAssets: assets.length,
    totalsByType: assets.reduce((accumulator, asset) => {
      accumulator[asset.type] = (accumulator[asset.type] || 0) + 1;
      return accumulator;
    }, {}),
    assets
  };
}
