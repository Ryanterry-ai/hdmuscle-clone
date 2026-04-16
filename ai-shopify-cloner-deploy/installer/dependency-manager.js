import { execSync } from "child_process";
import fs from "fs-extra";

/**
 * AI Shopify Cloner Dependency Manager
 * Auto-detects required packages based on system modules
 */

const BASE_DEPS = [
  "playwright",
  "axios",
  "cheerio",
  "fs-extra",
  "archiver",
  "ws",
  "glob",
  "node-fetch"
];

const CRAWLER_DEPS = [
  "playwright"
];

const IMAGE_DEPS = [
  "axios"
];

const DIFF_DEPS = [
  "pixelmatch",
  "pngjs"
];

const CLUSTER_DEPS = [
  "child_process"
];

const ANIMATION_DEPS = [
  "framer-motion",
  "gsap",
  "remotion"
];

const SHOPIFY_DEPS = [
  "@shopify/cli"
];

/**
 * Detect required modules based on enabled features
 */
export function detectRequiredDependencies(config = {}) {
  const deps = new Set(BASE_DEPS);

  // ---------------------------
  // CRAWLING SYSTEM
  // ---------------------------
  if (config.crawler) {
    CRAWLER_DEPS.forEach(d => deps.add(d));
  }

  // ---------------------------
  // IMAGE SYSTEM
  // ---------------------------
  if (config.images) {
    IMAGE_DEPS.forEach(d => deps.add(d));
  }

  // ---------------------------
  // DIFF SYSTEM
  // ---------------------------
  if (config.diff) {
    DIFF_DEPS.forEach(d => deps.add(d));
  }

  // ---------------------------
  // CLUSTER SYSTEM
  // ---------------------------
  if (config.cluster) {
    CLUSTER_DEPS.forEach(d => deps.add(d));
  }

  // ---------------------------
  // ANIMATION ENGINE (REMOTION + FRAMER + GSAP)
  // ---------------------------
  if (config.animations) {
    ANIMATION_DEPS.forEach(d => deps.add(d));
  }

  // ---------------------------
  // SHOPIFY SYSTEM
  // ---------------------------
  if (config.shopify) {
    SHOPIFY_DEPS.forEach(d => deps.add(d));
  }

  return Array.from(deps);
}

/**
 * Install dependencies safely
 */
export function installDependencies(config = {}) {
  const deps = detectRequiredDependencies(config);

  console.log("🚀 Installing AI Shopify Cloner Dependencies...");
  console.log("📦 Total packages:", deps.length);
  console.log("📦 Packages:", deps.join(", "));

  try {
    execSync(`npm install ${deps.join(" ")}`, {
      stdio: "inherit"
    });

    console.log("✅ Dependencies installed successfully!");
  } catch (err) {
    console.error("❌ Installation failed:", err.message);
  }
}

/**
 * Install Playwright browser engines
 */
export function installBrowsers() {
  console.log("🌐 Installing Playwright browsers...");

  try {
    execSync("npx playwright install", {
      stdio: "inherit"
    });

    console.log("✅ Browsers installed successfully!");
  } catch (err) {
    console.error("❌ Browser install failed:", err.message);
  }
}

/**
 * Full system bootstrap installer
 */
export function bootstrapSystem(config = {}) {
  console.log("⚙️ Bootstrapping AI Shopify Cloner System...");

  installDependencies(config);
  installBrowsers();

  console.log("🎯 System ready for execution!");
}

/**
 * Generate dependency report (for SaaS dashboard)
 */
export function generateDependencyReport(config = {}) {
  const deps = detectRequiredDependencies(config);

  const report = {
    totalDependencies: deps.length,
    dependencies: deps,
    modulesEnabled: config,
    timestamp: new Date().toISOString()
  };

  fs.writeJSONSync("./output/dependency-report.json", report, {
    spaces: 2
  });

  console.log("📊 Dependency report generated.");

  return report;
}
