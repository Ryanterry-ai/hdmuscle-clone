import { collectAssetsFromCrawlResults } from "./asset-utils.js";
import path from "path";
import {
  ARTIFACTS,
  ASSETS_DIR,
  ensureBaseOutputStructure,
  logStep,
  readJson,
  writeJson
} from "./pipeline-utils.js";
import fs from "fs-extra";

function mergeExistingAssetState(nextManifest, existingManifest) {
  const existingByUrl = new Map(
    (existingManifest?.assets || []).map(asset => [asset.normalizedUrl, asset])
  );

  const assets = nextManifest.assets.map(asset => {
    const existing = existingByUrl.get(asset.normalizedUrl);

    if (!existing) {
      return asset;
    }

    const inferredLocalPath =
      existing.localPath || path.join(ASSETS_DIR, asset.localRelativePath);
    const fileExists = fs.existsSync(inferredLocalPath);

    return {
      ...asset,
      downloaded: existing.downloaded || fileExists,
      status: fileExists ? "downloaded" : existing.status || asset.status,
      size: existing.size || (fileExists ? fs.statSync(inferredLocalPath).size : 0),
      contentType: existing.contentType || "",
      localPath: inferredLocalPath,
      error: existing.error || ""
    };
  });

  return {
    ...nextManifest,
    assets
  };
}

export async function extractAssets(crawlData) {
  const sourceData = crawlData || (await readJson(ARTIFACTS.crawlResults, "crawl results"));
  let manifest = collectAssetsFromCrawlResults(sourceData);

  if (await fs.pathExists(ARTIFACTS.assetManifest)) {
    const existingManifest = await fs.readJSON(ARTIFACTS.assetManifest);
    manifest = mergeExistingAssetState(manifest, existingManifest);
  }

  await ensureBaseOutputStructure();
  await writeJson(ARTIFACTS.assetManifest, manifest);

  logStep(
    "assets",
    `Manifest written with ${manifest.totalAssets} assets`
  );

  return manifest;
}

export async function run() {
  return extractAssets();
}

if (process.argv[1]?.endsWith("extract-assets.js")) {
  run().catch(error => {
    console.error(`[assets] Extraction failed: ${error.message}`);
    process.exit(1);
  });
}
