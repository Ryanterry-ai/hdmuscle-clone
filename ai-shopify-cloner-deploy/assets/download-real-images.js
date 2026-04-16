import path from "path";

import axios from "axios";
import fs from "fs-extra";

import { normalizeAssetUrl } from "../crawler/url-utils.js";
import {
  buildAssetRecord,
  collectAssetsFromCrawlResults,
  detectAssetTypeFromUrl
} from "../scripts/asset-utils.js";
import {
  ARTIFACTS,
  ASSETS_DIR,
  ensureBaseOutputStructure,
  logStep,
  readJson,
  writeJson
} from "../scripts/pipeline-utils.js";

const DOWNLOAD_TIMEOUT_MS = Number(process.env.CLONER_ASSET_TIMEOUT_MS || 45000);

function parseCssAssetUrls(cssText, baseUrl) {
  const urls = [];

  for (const match of cssText.matchAll(/url\(["']?(.*?)["']?\)/g)) {
    const candidate = match[1]?.trim();

    if (!candidate || candidate.startsWith("data:") || candidate.startsWith("#")) {
      continue;
    }

    const normalized = normalizeAssetUrl(candidate, baseUrl);

    if (normalized) {
      urls.push(normalized);
    }
  }

  return [...new Set(urls)];
}

function mergeRecord(target, source) {
  return {
    ...target,
    ...source,
    discoveredOnPages: [
      ...new Set([
        ...(target.discoveredOnPages || []),
        ...(source.discoveredOnPages || [])
      ])
    ],
    sourceKinds: [
      ...new Set([...(target.sourceKinds || []), ...(source.sourceKinds || [])])
    ]
  };
}

async function ensureAssetFolders(records) {
  await ensureBaseOutputStructure();

  const folders = new Set(records.map(record => record.folder));

  for (const folder of folders) {
    await fs.ensureDir(path.join(ASSETS_DIR, folder));
  }
}

async function loadManifest(input) {
  if (input?.assets) {
    return input;
  }

  if (input?.pages) {
    return collectAssetsFromCrawlResults(input);
  }

  if (Array.isArray(input)) {
    return collectAssetsFromCrawlResults({ pages: input });
  }

  return readJson(ARTIFACTS.assetManifest, "asset manifest");
}

async function downloadSingleAsset(record) {
  const response = await axios.get(record.normalizedUrl, {
    responseType: "arraybuffer",
    timeout: DOWNLOAD_TIMEOUT_MS,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    }
  });

  const contentType = response.headers["content-type"] || "";
  const normalizedRecord = mergeRecord(
    record,
    buildAssetRecord(record.normalizedUrl, {
      pageUrl: record.discoveredOnPages?.[0],
      discoveredOnPages: record.discoveredOnPages,
      sourceKinds: record.sourceKinds,
      contentType
    }) || {}
  );

  const absolutePath = path.join(ASSETS_DIR, normalizedRecord.localRelativePath);

  await fs.ensureDir(path.dirname(absolutePath));
  await fs.writeFile(absolutePath, response.data);

  return {
    ...normalizedRecord,
    downloaded: true,
    status: "downloaded",
    contentType,
    size: Buffer.byteLength(response.data),
    localPath: absolutePath
  };
}

export async function downloadImages(input) {
  const manifest = await loadManifest(input);
  const assets = [...(manifest.assets || [])];
  const indexByUrl = new Map();

  for (const asset of assets) {
    indexByUrl.set(asset.normalizedUrl, asset);
  }

  await ensureAssetFolders(assets);

  let downloadedCount = 0;
  let failedCount = 0;
  let nestedDiscoveredCount = 0;

  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];

    if (!asset?.normalizedUrl) {
      continue;
    }

    try {
      logStep("download", `Fetching ${asset.normalizedUrl}`);
      const downloaded = await downloadSingleAsset(asset);
      assets[index] = downloaded;
      indexByUrl.set(downloaded.normalizedUrl, downloaded);
      downloadedCount += 1;

      if (
        detectAssetTypeFromUrl(downloaded.normalizedUrl, downloaded.contentType) ===
        "css"
      ) {
        const cssText = await fs.readFile(downloaded.localPath, "utf8");
        const nestedUrls = parseCssAssetUrls(cssText, downloaded.normalizedUrl);

        for (const nestedUrl of nestedUrls) {
          if (indexByUrl.has(nestedUrl)) {
            continue;
          }

          const nestedRecord = buildAssetRecord(nestedUrl, {
            pageUrl: downloaded.discoveredOnPages?.[0],
            discoveredOnPages: downloaded.discoveredOnPages,
            sourceKind: "css-nested"
          });

          if (!nestedRecord) {
            continue;
          }

          assets.push(nestedRecord);
          indexByUrl.set(nestedRecord.normalizedUrl, nestedRecord);
          nestedDiscoveredCount += 1;
        }
      }
    } catch (error) {
      failedCount += 1;
      assets[index] = {
        ...asset,
        downloaded: false,
        status: "failed",
        error: error.message
      };
      logStep("download", `Failed ${asset.normalizedUrl}: ${error.message}`);
    }
  }

  const finalManifest = {
    ...manifest,
    createdAt: manifest.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalAssets: assets.length,
    downloadedCount,
    failedCount,
    nestedDiscoveredCount,
    totalsByType: assets.reduce((accumulator, asset) => {
      accumulator[asset.type] = (accumulator[asset.type] || 0) + 1;
      return accumulator;
    }, {}),
    assets
  };

  await writeJson(ARTIFACTS.assetManifest, finalManifest);

  logStep(
    "download",
    `Completed ${downloadedCount} downloads with ${failedCount} failures`
  );

  return finalManifest;
}
