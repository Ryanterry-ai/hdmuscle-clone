import { downloadImages } from "../assets/download-real-images.js";
import { humanCrawl } from "../crawler/human-crawler.js";
import { mapSite } from "../crawler/site-mapper.js";
import { profileSite } from "../intelligence/site-profiler.js";
import { buildZip } from "./build-theme-zip.js";
import { classifyPages } from "./classify-pages.js";
import { exportStaticSite } from "./export-static-site.js";
import { buildStaticZip } from "./build-static-zip.js";
import { extractAssets } from "./extract-assets.js";
import { extractProducts } from "./extract-products.js";
import { generateTheme } from "./generate-shopify-theme.js";
import {
  ARTIFACTS,
  ensureBaseOutputStructure,
  logStep,
  readCliUrl,
  writeJson
} from "./pipeline-utils.js";
import { validateTheme } from "./validate-theme.js";
import { validateStaticExport } from "./validate-static-export.js";

export async function run(url) {
  if (!url) {
    throw new Error("Please provide a target URL. Example: node scripts/crawl-site.js https://hdmuscle.com");
  }

  await ensureBaseOutputStructure();

  logStep("pipeline", "AI Shopify Cloner starting");
  logStep("pipeline", `Target URL: ${url}`);

  const siteMap = await mapSite(url);
  await writeJson(ARTIFACTS.siteMap, siteMap);
  logStep("pipeline", `Saved site map to ${ARTIFACTS.siteMap}`);

  if (siteMap.limit?.requiresProUpgrade) {
    throw new Error(siteMap.plan?.upgradeMessage || "Upgrade to PRO to crawl more than 600 pages.");
  }

  const crawlResults = await humanCrawl(siteMap);
  await writeJson(ARTIFACTS.crawlResults, crawlResults);
  logStep("pipeline", `Saved crawl results to ${ARTIFACTS.crawlResults}`);

  const profile = profileSite(crawlResults.pages);
  await writeJson(ARTIFACTS.siteProfile, profile);
  logStep("pipeline", `Saved site profile to ${ARTIFACTS.siteProfile}`);

  const assetManifest = await extractAssets(crawlResults);
  const downloadedAssets = await downloadImages(assetManifest);

  const products = await extractProducts(crawlResults);
  const pageClassification = await classifyPages(crawlResults);

  const themeData = await generateTheme({
    siteMap,
    crawlResults,
    profile,
    products,
    pageClassification,
    assetManifest: downloadedAssets
  });

  await validateTheme(themeData);
  const zipInfo = await buildZip();
  const staticExport = await exportStaticSite({
    crawlResults,
    assetManifest: downloadedAssets
  });
  const staticValidation = await validateStaticExport();
  const staticZip = await buildStaticZip();

  logStep("pipeline", "Pipeline completed successfully");

  return {
    siteMap,
    crawlResults,
    profile,
    products,
    pageClassification,
    assetManifest: downloadedAssets,
    themeData,
    zipInfo,
    staticExport,
    staticValidation,
    staticZip
  };
}

if (process.argv[1]?.endsWith("crawl-site.js")) {
  run(readCliUrl())
    .then(() => {
      logStep("pipeline", "Full pipeline completed");
    })
    .catch(error => {
      console.error(`[pipeline] Failed: ${error.message}`);
      process.exit(1);
    });
}
