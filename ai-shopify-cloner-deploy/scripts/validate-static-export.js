import path from "path";

import * as cheerio from "cheerio";
import fs from "fs-extra";

import {
  ARTIFACTS,
  ROOT_PUBLIC_DIR,
  STATIC_PUBLIC_DIR,
  logStep,
  readJson
} from "./pipeline-utils.js";

const REQUIRED_STATIC_FILES = [
  path.join(STATIC_PUBLIC_DIR, "index.html"),
  path.join(STATIC_PUBLIC_DIR, ".htaccess"),
  path.join(STATIC_PUBLIC_DIR, "404.html"),
  path.join(STATIC_PUBLIC_DIR, "vercel.json"),
  ARTIFACTS.staticManifest
];

const OPTIONAL_APP_ROUTES = new Set([
  "/cart/",
  "/cart",
  "/cart/add",
  "/account/",
  "/account",
  "/search/",
  "/search",
  "/contact",
  "/customer_authentication/redirect",
  "/localization"
]);

function isExternalHref(value = "") {
  return /^(https?:|\/\/|mailto:|tel:|#|data:|javascript:)/i.test(value);
}

function stripQueryAndHash(value = "") {
  return String(value || "").split("#")[0].split("?")[0];
}

function looksLikeAssetPath(value = "") {
  const clean = stripQueryAndHash(value);
  return /\.[a-z0-9]{1,8}$/i.test(clean);
}

function normalizeLocalReference(value = "") {
  const clean = stripQueryAndHash(value).trim();

  if (!clean) return "";
  if (clean === "." || clean === "./") return ".";

  return clean;
}

function isRootRelative(value = "") {
  return value.startsWith("/");
}

function isIgnoredRemoteRuntime(refValue = "") {
  return /web-pixels|shopifycloud|monorail-edge|\/web-pixels@/i.test(refValue);
}

function isOptionalAssetRoute(refValue = "") {
  return /\.atom$|\.xml$|\.oembed$|\/feeds?\//i.test(refValue) ||
    /\/cdn\/shop\//i.test(refValue);
}

function isOptionalStorefrontRoute(refValue = "") {
  return (
    OPTIONAL_APP_ROUTES.has(refValue) ||
    /^\/products\//i.test(refValue) ||
    /^\/collections\//i.test(refValue) ||
    /^\/pages\//i.test(refValue) ||
    /^\/blogs\//i.test(refValue) ||
    /^\/policies\//i.test(refValue) ||
    /^\/customer_authentication\//i.test(refValue) ||
    /^\/account\//i.test(refValue) ||
    /^\/search\//i.test(refValue) ||
    /^\/cart\//i.test(refValue) ||
    /^\/contact\/?$/i.test(refValue) ||
    /^\/localization\/?$/i.test(refValue)
  );
}

function resolveRef(pageFile, refValue) {
  const clean = normalizeLocalReference(refValue);
  if (!clean || clean === ".") return "";

  if (isRootRelative(clean)) {
    return path.join(STATIC_PUBLIC_DIR, clean);
  }

  return path.resolve(path.dirname(pageFile), clean);
}

async function validatePathExists(filePath, label = filePath) {
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    throw new Error(`Missing required static export file: ${label}`);
  }
}

function collectLocalReferences($) {
  const refs = [];

  $("[src]").each((_, element) => {
    const value = $(element).attr("src");
    if (value && !isExternalHref(value)) {
      refs.push({ type: "asset", value });
    }
  });

  $("link[href]").each((_, element) => {
    const value = $(element).attr("href");
    if (value && !isExternalHref(value)) {
      const normalized = normalizeLocalReference(value);
      const type = looksLikeAssetPath(normalized) ? "asset" : "page";
      refs.push({ type, value: normalized });
    }
  });

  $("a[href]").each((_, element) => {
    const value = $(element).attr("href");
    if (value && !isExternalHref(value)) {
      const normalized = normalizeLocalReference(value);
      const type = looksLikeAssetPath(normalized) ? "asset" : "page";
      refs.push({ type, value: normalized });
    }
  });

  $("form[action]").each((_, element) => {
    const value = $(element).attr("action");
    if (value && !isExternalHref(value)) {
      const normalized = normalizeLocalReference(value);
      refs.push({ type: "page", value: normalized });
    }
  });

  return refs;
}

async function validatePageReference(pageFile, refValue) {
  const clean = normalizeLocalReference(refValue);

  if (!clean || clean === ".") return;

  if (isIgnoredRemoteRuntime(clean)) {
    logStep("static-validate", `Warning: ignored stripped remote runtime route ${clean}`);
    return;
  }

  if (OPTIONAL_APP_ROUTES.has(clean)) {
    logStep("static-validate", `Warning: optional route not validated strictly: ${clean}`);
    return;
  }

  const resolved = resolveRef(pageFile, clean);
  if (!resolved) return;

  const candidates = [];

  if (resolved.endsWith(".html")) {
    candidates.push(resolved);
  } else {
    candidates.push(path.join(resolved, "index.html"));
    candidates.push(`${resolved}.html`);
  }

  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      return;
    }
  }

  if (isOptionalStorefrontRoute(clean)) {
    logStep(
      "static-validate",
      `Warning: missing exported storefront route '${refValue}' referenced by ${pageFile}`
    );
    return;
  }

  throw new Error(`Static export is missing page route '${refValue}' referenced by ${pageFile}`);
}

async function validateAssetReference(pageFile, refValue) {
  const clean = normalizeLocalReference(refValue);

  if (!clean || clean === ".") return;

  if (isIgnoredRemoteRuntime(clean)) {
    logStep("static-validate", `Warning: ignored stripped remote runtime asset ${clean}`);
    return;
  }

  if (isOptionalAssetRoute(clean)) {
    logStep("static-validate", `Warning: optional asset not validated: ${clean}`);
    return;
  }

  const resolved = resolveRef(pageFile, clean);
  if (!resolved) return;

  if (!(await fs.pathExists(resolved))) {
    throw new Error(`Static export is missing local asset '${refValue}' referenced by ${pageFile}`);
  }
}

async function validatePageFile(pageFile) {
  const html = await fs.readFile(pageFile, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });
  const refs = collectLocalReferences($);

  for (const ref of refs) {
    if (ref.type === "asset") {
      await validateAssetReference(pageFile, ref.value);
      continue;
    }

    await validatePageReference(pageFile, ref.value);
  }
}

async function validateVercelConfig() {
  const vercelPath = path.join(STATIC_PUBLIC_DIR, "vercel.json");
  await validatePathExists(vercelPath, vercelPath);

  const raw = await fs.readFile(vercelPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.rewrites) || !parsed.rewrites.length) {
    throw new Error("vercel.json is present but missing rewrites");
  }
}

export async function validateStaticExport() {
  for (const filePath of REQUIRED_STATIC_FILES) {
    await validatePathExists(filePath);
  }

  await validatePathExists(path.join(ROOT_PUBLIC_DIR, "index.html"), "root public index");
  await validateVercelConfig();

  const manifest = await readJson(ARTIFACTS.staticManifest, "static export manifest");

  for (const page of manifest.pages || []) {
    await validatePathExists(page.file, page.url);
    await validatePageFile(page.file);
  }

  logStep("static-validate", `Static export validation passed for ${manifest.totalPages} pages`);
  return {
    valid: true,
    totalPages: manifest.totalPages,
    copiedAssets: manifest.copiedAssets
  };
}

export async function run() {
  return validateStaticExport();
}

if (process.argv[1]?.endsWith("validate-static-export.js")) {
  run().catch(error => {
    console.error(`[static-validate] Validation failed: ${error.message}`);
    process.exit(1);
  });
}