import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

import {
  ARTIFACTS,
  STATIC_PUBLIC_DIR,
  logStep,
  readJson
} from "./pipeline-utils.js";

const OPTIONAL_APP_ROUTES = new Set([
  "/cart/",
  "/cart",
  "/account/",
  "/account",
  "/search/",
  "/search"
]);

function isExternalHref(value = "") {
  return /^(https?:|\/\/|mailto:|tel:|#|data:|javascript:)/i.test(value);
}

function stripQueryAndHash(value = "") {
  return String(value || "").split("#")[0].split("?")[0];
}

function isRootRelative(ref = "") {
  return ref.startsWith("/");
}

function resolveRef(pageFile, refValue) {
  const clean = stripQueryAndHash(refValue).trim();
  if (!clean) return "";

  if (isRootRelative(clean)) {
    return path.join(STATIC_PUBLIC_DIR, clean);
  }

  return path.resolve(path.dirname(pageFile), clean);
}

function looksLikeAssetPath(value = "") {
  const clean = stripQueryAndHash(value);
  return /\.[a-z0-9]{1,8}$/i.test(clean);
}

async function validatePathExists(filePath, label = filePath) {
  const exists = await fs.promises
    .stat(filePath)
    .then(() => true)
    .catch(() => false);

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
      const type = looksLikeAssetPath(value) ? "asset" : "page";
      refs.push({ type, value });
    }
  });

  $("a[href]").each((_, element) => {
    const value = $(element).attr("href");
    if (value && !isExternalHref(value)) {
      const type = looksLikeAssetPath(value) ? "asset" : "page";
      refs.push({ type, value });
    }
  });

  $("form[action]").each((_, element) => {
    const value = $(element).attr("action");
    if (value && !isExternalHref(value)) {
      refs.push({ type: "page", value });
    }
  });

  return refs;
}

async function validatePageReference(pageFile, refValue) {
  const clean = stripQueryAndHash(refValue).trim();
  if (!clean || clean === ".") return;

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
    if (await fs.promises.stat(candidate).then(() => true).catch(() => false)) {
      return;
    }
  }

  throw new Error(`Static export is missing page route '${refValue}' referenced by ${pageFile}`);
}

async function validateAssetReference(pageFile, refValue) {
  const clean = stripQueryAndHash(refValue).trim();
  if (!clean || clean === ".") return;

  const resolved = resolveRef(pageFile, clean);
  if (!resolved) return;

  const exists = await fs.promises.stat(resolved).then(() => true).catch(() => false);
  if (!exists) {
    throw new Error(`Static export is missing local asset '${refValue}' referenced by ${pageFile}`);
  }
}

async function validatePageFile(pageFile) {
  const html = await fs.promises.readFile(pageFile, "utf8");
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

  const raw = await fs.promises.readFile(vercelPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.rewrites) || !parsed.rewrites.length) {
    throw new Error("vercel.json is present but missing rewrites");
  }
}

export async function validateStaticExport() {
  await validatePathExists(path.join(STATIC_PUBLIC_DIR, "index.html"));
  await validatePathExists(path.join(STATIC_PUBLIC_DIR, ".htaccess"));
  await validatePathExists(path.join(STATIC_PUBLIC_DIR, "404.html"));
  await validateVercelConfig();
  await validatePathExists(ARTIFACTS.staticManifest);

  const manifest = await readJson(ARTIFACTS.staticManifest, "static export manifest");

  for (const page of manifest.pages || []) {
    await validatePathExists(page.file, page.url);
    await validatePageFile(page.file);
  }

  logStep("static-validate", `Static export validation passed for ${manifest.totalPages} pages`);
  return {
    valid: true,
    totalPages: manifest.totalPages
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