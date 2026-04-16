import path from "path";

import fs from "fs-extra";

import { normalizeAssetUrl } from "../crawler/url-utils.js";
import { detectAssetTypeFromUrl } from "./asset-utils.js";
import {
  ARTIFACTS,
  ASSETS_DIR,
  THEME_DIR,
  envNumber,
  logStep,
  sanitizeFilename,
  toCsv,
  writeJson
} from "./pipeline-utils.js";

const DEFAULT_THEME_MODE = (process.env.CLONER_THEME_MODE || "slim").toLowerCase();
const DEFAULT_IMAGE_MAX_BYTES = envNumber(
  "CLONER_THEME_IMAGE_MAX_BYTES",
  220 * 1024
);
const DEFAULT_IMAGE_BUDGET_BYTES = envNumber(
  "CLONER_THEME_IMAGE_BUDGET_BYTES",
  8 * 1024 * 1024
);
const DEFAULT_MISC_MAX_BYTES = envNumber(
  "CLONER_THEME_MISC_MAX_BYTES",
  128 * 1024
);

function normalizeThemeMode(mode = DEFAULT_THEME_MODE) {
  return mode === "full" ? "full" : "slim";
}

function normalizeBytes(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function uniq(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function inferSourcePath(asset) {
  return (
    asset.localPath || path.join(ASSETS_DIR, asset.localRelativePath || "")
  );
}

function isBrandAsset(asset) {
  return /logo|brand|icon|favicon|mark/i.test(
    `${asset.themeAssetName} ${asset.fileName} ${asset.normalizedUrl}`
  );
}

function buildProductIndexes(products = { products: [] }) {
  const assetToProducts = new Map();
  const pageUrlToHandle = new Map();

  for (const product of products.products || []) {
    if (product.url && product.handle) {
      pageUrlToHandle.set(normalizeAssetUrl(product.url), product.handle);
    }

    for (const imageUrl of product.images || []) {
      const normalized = normalizeAssetUrl(imageUrl);
      if (!normalized) continue;

      const existing = assetToProducts.get(normalized) || [];
      existing.push({
        productHandle: product.handle,
        productTitle: product.title
      });
      assetToProducts.set(normalized, existing);
    }
  }

  return { assetToProducts, pageUrlToHandle };
}

function buildUploadTargets(asset, productIndexes) {
  const directProducts = productIndexes.assetToProducts.get(asset.normalizedUrl) || [];
  const inferredProducts = uniq(
    (asset.discoveredOnPages || [])
      .map(pageUrl => productIndexes.pageUrlToHandle.get(normalizeAssetUrl(pageUrl)))
      .filter(Boolean)
  ).map(handle => ({ productHandle: handle, productTitle: "" }));
  const productTargets = uniq(
    [...directProducts, ...inferredProducts].map(target => target.productHandle)
  ).map(handle => {
    const directMatch = [...directProducts, ...inferredProducts].find(
      target => target.productHandle === handle
    );

    return {
      productHandle: handle,
      productTitle: directMatch?.productTitle || ""
    };
  });

  if (productTargets.length && ["image", "media"].includes(asset.type)) {
    return {
      uploadTarget: "product_media",
      productTargets
    };
  }

  if (["image", "media"].includes(asset.type)) {
    return {
      uploadTarget: "files",
      productTargets: []
    };
  }

  return {
    uploadTarget: "external_reference",
    productTargets: []
  };
}

function buildExcludedAssetRecord(asset, productIndexes) {
  const sourcePath = inferSourcePath(asset);
  const uploadInfo = buildUploadTargets(asset, productIndexes);
  const alt =
    uploadInfo.productTargets[0]?.productTitle ||
    sanitizeFilename(path.basename(asset.fileName, path.extname(asset.fileName)), asset.type)
      .replace(/-/g, " ")
      .trim();

  return {
    normalizedUrl: asset.normalizedUrl,
    originalUrl: asset.url,
    type: asset.type,
    size: asset.size || 0,
    contentType: asset.contentType || "",
    fileName: asset.fileName,
    suggestedShopifyFilename: asset.fileName,
    localPath: sourcePath,
    localRelativePath: asset.localRelativePath,
    discoveredOnPages: asset.discoveredOnPages || [],
    sourceKinds: asset.sourceKinds || [],
    uploadTarget: uploadInfo.uploadTarget,
    productTargets: uploadInfo.productTargets,
    alt,
    referenceStrategy: "external_url_fallback"
  };
}

function shouldEmbedAsset(asset, context) {
  if (context.themeMode === "full") {
    return true;
  }

  if (!asset.downloaded) {
    return false;
  }

  if (["css", "js", "font", "svg"].includes(asset.type)) {
    return true;
  }

  if (asset.type === "media") {
    return false;
  }

  if (asset.type === "image") {
    if (isBrandAsset(asset)) {
      return true;
    }

    const size = asset.size || 0;
    if (size > context.imageMaxBytes) {
      return false;
    }

    if (context.imageBytesUsed + size > context.imageBudgetBytes) {
      return false;
    }

    return false;
  }

  return (asset.size || 0) <= context.miscMaxBytes;
}

function buildAssetRefs(assets, themeMode) {
  const refs = new Map();

  for (const asset of assets) {
    if (asset.embedInTheme && asset.downloaded) {
      refs.set(asset.normalizedUrl, {
        kind: "asset",
        value: asset.themeAssetName,
        asset
      });
      continue;
    }

    refs.set(asset.normalizedUrl, {
      kind: "remote",
      value: asset.normalizedUrl,
      asset
    });
  }

  return refs;
}

function rewriteCss(cssText, cssAsset, assetsByUrl, refsByUrl) {
  return cssText.replace(/url\(["']?(.*?)["']?\)/g, (_, rawValue) => {
    const candidate = rawValue?.trim();

    if (!candidate || candidate.startsWith("data:") || candidate.startsWith("#")) {
      return `url("${candidate}")`;
    }

    const normalized = normalizeAssetUrl(candidate, cssAsset.normalizedUrl);
    const matchedAsset = assetsByUrl.get(normalized);
    const ref = refsByUrl.get(normalized);

    if (ref?.kind === "asset") {
      return `url('{{ '${ref.value}' | asset_url }}')`;
    }

    if (ref?.kind === "remote") {
      return `url("${ref.value}")`;
    }

    if (matchedAsset?.normalizedUrl) {
      return `url("${matchedAsset.normalizedUrl}")`;
    }

    return `url("${candidate}")`;
  });
}

export function resolveAssetReference(url, refsByUrl) {
  if (!url) return null;
  return refsByUrl.get(normalizeAssetUrl(url)) || null;
}

export function assetReferenceToSrc(ref) {
  if (!ref?.value) {
    return "";
  }

  if (ref.kind === "asset") {
    return `{{ '${ref.value}' | asset_url }}`;
  }

  return ref.value;
}

export async function prepareThemeAssets({ assetManifest, products, themeMode }) {
  const normalizedThemeMode = normalizeThemeMode(themeMode);
  const assets = (assetManifest.assets || []).map(asset => ({ ...asset }));
  const productIndexes = buildProductIndexes(products);
  const context = {
    themeMode: normalizedThemeMode,
    imageMaxBytes: normalizeBytes(process.env.CLONER_THEME_IMAGE_MAX_BYTES, DEFAULT_IMAGE_MAX_BYTES),
    imageBudgetBytes: normalizeBytes(
      process.env.CLONER_THEME_IMAGE_BUDGET_BYTES,
      DEFAULT_IMAGE_BUDGET_BYTES
    ),
    miscMaxBytes: normalizeBytes(process.env.CLONER_THEME_MISC_MAX_BYTES, DEFAULT_MISC_MAX_BYTES),
    imageBytesUsed: 0
  };

  for (const asset of assets) {
    asset.sourcePath = inferSourcePath(asset);
    asset.embedInTheme = shouldEmbedAsset(asset, context);

    if (asset.embedInTheme && asset.type === "image") {
      context.imageBytesUsed += asset.size || 0;
    }
  }

  const refsByUrl = buildAssetRefs(assets, normalizedThemeMode);
  const assetsByUrl = new Map(assets.map(asset => [asset.normalizedUrl, asset]));
  const copied = [];
  const excluded = [];
  const includedCssAssets = [];
  const themeAssetsDir = path.join(THEME_DIR, "assets");

  await fs.ensureDir(themeAssetsDir);

  for (const asset of assets) {
    if (!asset.downloaded || !asset.embedInTheme) {
      if (!asset.embedInTheme) {
        excluded.push(buildExcludedAssetRecord(asset, productIndexes));
      }
      continue;
    }

    const targetPath = path.join(themeAssetsDir, asset.themeAssetName);

    if (asset.type === "css") {
      const cssText = await fs.readFile(asset.sourcePath, "utf8");
      const rewrittenCss = rewriteCss(cssText, asset, assetsByUrl, refsByUrl);
      await fs.writeFile(targetPath, rewrittenCss, "utf8");
      includedCssAssets.push(asset.themeAssetName.replace(/\.liquid$/i, ""));
    } else {
      await fs.copy(asset.sourcePath, targetPath);
    }

    copied.push({
      url: asset.normalizedUrl,
      themeAssetName: asset.themeAssetName,
      type: asset.type,
      size: asset.size || 0
    });
  }

  const filesUploadRows = excluded
    .filter(asset => asset.uploadTarget === "files")
    .map(asset => ({
      filename: asset.suggestedShopifyFilename,
      originalSource: asset.originalUrl,
      contentType: asset.contentType,
      alt: asset.alt,
      localPath: asset.localPath,
      sourceUrl: asset.normalizedUrl
    }));

  const productMediaUpload = excluded
    .filter(asset => asset.uploadTarget === "product_media")
    .flatMap(asset =>
      asset.productTargets.map(target => ({
        productHandle: target.productHandle,
        productTitle: target.productTitle,
        originalSource: asset.originalUrl,
        localPath: asset.localPath,
        mediaContentType:
          asset.type === "media" || detectAssetTypeFromUrl(asset.originalUrl, asset.contentType) === "media"
            ? "VIDEO"
            : "IMAGE",
        alt: asset.alt,
        sourceUrl: asset.normalizedUrl,
        filename: asset.suggestedShopifyFilename
      }))
    );

  const mediaManifest = {
    createdAt: new Date().toISOString(),
    themeMode: normalizedThemeMode,
    summary: {
      copiedCount: copied.length,
      excludedCount: excluded.length,
      copiedBytes: copied.reduce((sum, asset) => sum + (asset.size || 0), 0),
      excludedBytes: excluded.reduce((sum, asset) => sum + (asset.size || 0), 0),
      imageBudgetBytes: context.imageBudgetBytes
    },
    excludedAssets: excluded
  };

  await writeJson(ARTIFACTS.mediaManifest, mediaManifest);
  await fs.writeFile(ARTIFACTS.filesUploadCsv, toCsv(filesUploadRows), "utf8");
  await writeJson(ARTIFACTS.productMediaUpload, {
    createdAt: new Date().toISOString(),
    totalEntries: productMediaUpload.length,
    entries: productMediaUpload
  });

  logStep(
    "media",
    `Prepared ${copied.length} embedded assets and ${excluded.length} excluded assets for ${normalizedThemeMode} mode`
  );

  return {
    themeMode: normalizedThemeMode,
    refsByUrl,
    copied,
    excluded,
    cssAssets: includedCssAssets,
    mediaManifest,
    filesUploadRows,
    productMediaUpload
  };
}
