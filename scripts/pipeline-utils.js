import crypto from "crypto";
import path from "path";
import fs from "fs-extra";

export const ROOT_DIR = process.cwd();
export const OUTPUT_DIR = path.join(ROOT_DIR, "output");
export const ASSETS_DIR = path.join(OUTPUT_DIR, "assets");
export const THEME_DIR = path.join(OUTPUT_DIR, "theme");
export const CATALOG_DIR = path.join(OUTPUT_DIR, "catalog");
export const STATIC_PUBLIC_DIR = path.join(OUTPUT_DIR, "public");
export const ROOT_PUBLIC_DIR = path.join(ROOT_DIR, "public");

export const ARTIFACTS = {
  siteMap: path.join(OUTPUT_DIR, "site-map.json"),
  crawlResults: path.join(OUTPUT_DIR, "crawl-results.json"),
  siteProfile: path.join(OUTPUT_DIR, "site-profile.json"),
  pageClassification: path.join(OUTPUT_DIR, "page-classification.json"),
  products: path.join(OUTPUT_DIR, "products.json"),
  collections: path.join(OUTPUT_DIR, "collections.json"),
  assetManifest: path.join(ASSETS_DIR, "asset-manifest.json"),
  productsCsv: path.join(CATALOG_DIR, "products.csv"),
  productsAdminCsv: path.join(CATALOG_DIR, "products-admin-import.csv"),
  collectionsCsv: path.join(CATALOG_DIR, "collections.csv"),
  mediaManifest: path.join(OUTPUT_DIR, "media-manifest.json"),
  filesUploadCsv: path.join(OUTPUT_DIR, "files-upload.csv"),
  productMediaUpload: path.join(OUTPUT_DIR, "product-media-upload.json"),
  shopifyUploadResults: path.join(OUTPUT_DIR, "shopify-upload-results.json"),
  shopifyCollectionResults: path.join(OUTPUT_DIR, "shopify-collection-results.json"),
  staticManifest: path.join(STATIC_PUBLIC_DIR, "export-manifest.json"),
  staticZip: path.join(OUTPUT_DIR, "public.zip"),
  themeData: path.join(THEME_DIR, "theme-data.json"),
  themeZip: path.join(OUTPUT_DIR, "theme.zip")
};

export async function ensureBaseOutputStructure() {
  await fs.ensureDir(OUTPUT_DIR);
  await fs.ensureDir(ASSETS_DIR);
  await fs.ensureDir(THEME_DIR);
  await fs.ensureDir(CATALOG_DIR);
  await fs.ensureDir(STATIC_PUBLIC_DIR);
}

export async function writeJson(filePath, data) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJSON(filePath, data, { spaces: 2 });
}

export async function readJson(filePath, label = filePath) {
  const exists = await fs.pathExists(filePath);

  if (!exists) {
    throw new Error(`Missing required artifact: ${label} (${filePath})`);
  }

  return fs.readJSON(filePath);
}

export async function requireArtifact(filePath, label = filePath) {
  const exists = await fs.pathExists(filePath);

  if (!exists) {
    throw new Error(`Required artifact not found: ${label} (${filePath})`);
  }

  return filePath;
}

export function logStep(stage, message) {
  console.log(`[${stage}] ${message}`);
}

export function stableHash(value, length = 10) {
  return crypto
    .createHash("sha1")
    .update(String(value))
    .digest("hex")
    .slice(0, length);
}

export function sanitizeFilename(value, fallback = "file") {
  const base = String(value || fallback)
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return base || fallback;
}

export function withExtension(fileName, extension, fallback = ".bin") {
  const normalizedExtension = extension?.startsWith(".")
    ? extension
    : extension
      ? `.${extension}`
      : fallback;

  return fileName.endsWith(normalizedExtension)
    ? fileName
    : `${fileName}${normalizedExtension}`;
}

export function clampText(value, maxLength = 240) {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function uniqueBy(items, keyFn) {
  const seen = new Set();
  const results = [];

  for (const item of items || []) {
    const key = keyFn(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push(item);
  }

  return results;
}

export function escapeLiquidString(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, " ");
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function toHandle(value, fallback = "item") {
  const handle = sanitizeFilename(value, fallback)
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return handle || fallback;
}

export function readCliUrl() {
  return process.argv[2];
}

export function readCliArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const match = process.argv.slice(2).find(value => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

export function envFlag(name, fallback = false) {
  const raw = process.env[name];

  if (raw == null || raw === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(raw).trim().toLowerCase());
}

export function envNumber(name, fallback) {
  const raw = process.env[name];
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function summarizeCounts(record = {}) {
  return Object.entries(record)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

export function toCsv(rows = []) {
  if (!rows.length) {
    return "";
  }

  const headers = [...new Set(rows.flatMap(row => Object.keys(row)))];
  const escapeCell = value => {
    const normalized = String(value ?? "");
    if (/[",\r\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  };

  return [
    headers.join(","),
    ...rows.map(row => headers.map(header => escapeCell(row[header])).join(","))
  ].join("\n");
}
