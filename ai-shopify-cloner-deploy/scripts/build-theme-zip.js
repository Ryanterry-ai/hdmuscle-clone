import fs from "fs";
import path from "path";

import archiver from "archiver";

import {
  ARTIFACTS,
  THEME_DIR,
  logStep
} from "./pipeline-utils.js";

const SHOPIFY_THEME_ZIP_LIMIT_BYTES = 50 * 1024 * 1024;
const NON_CRITICAL_MAX_BYTES = 2 * 1024 * 1024;

const ALWAYS_KEEP_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".liquid",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf"
]);

const ALWAYS_EXCLUDE_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".avi",
  ".m4v",
  ".mp3",
  ".wav",
  ".ogg",
  ".flac",
  ".aac"
]);

const ALWAYS_KEEP_DIRECTORIES = [
  "layout",
  "templates",
  "sections",
  "snippets",
  "config",
  "locales"
];

function normalizeRelative(filePath) {
  return filePath.replace(/\\/g, "/");
}

function isInsideAlwaysKeepDirectory(relativePath) {
  const normalized = normalizeRelative(relativePath);
  return ALWAYS_KEEP_DIRECTORIES.some(dir => normalized === dir || normalized.startsWith(`${dir}/`));
}

function shouldExcludeFile(relativePath, stats) {
  const normalized = normalizeRelative(relativePath);
  const ext = path.extname(normalized).toLowerCase();

  if (isInsideAlwaysKeepDirectory(normalized)) {
    return { exclude: false, reason: "" };
  }

  if (ALWAYS_EXCLUDE_EXTENSIONS.has(ext)) {
    return { exclude: true, reason: "video/audio asset excluded" };
  }

  if (ALWAYS_KEEP_EXTENSIONS.has(ext)) {
    return { exclude: false, reason: "" };
  }

  if (stats.size > NON_CRITICAL_MAX_BYTES) {
    return {
      exclude: true,
      reason: `non-critical asset > ${Math.round(NON_CRITICAL_MAX_BYTES / (1024 * 1024))} MB`
    };
  }

  return { exclude: false, reason: "" };
}

async function collectFiles(directory, rootDirectory = directory) {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(rootDirectory, absolute);

    if (entry.isDirectory()) {
      const nested = await collectFiles(absolute, rootDirectory);
      files.push(...nested);
      continue;
    }

    const stats = await fs.promises.stat(absolute);
    files.push({
      absolute,
      relative,
      size: stats.size
    });
  }

  return files;
}

export async function buildZip() {
  const themeExists = await fs.promises
    .stat(THEME_DIR)
    .then(stats => stats.isDirectory())
    .catch(() => false);

  if (!themeExists) {
    throw new Error(`Theme directory does not exist: ${THEME_DIR}`);
  }

  const allFiles = await collectFiles(THEME_DIR);

  if (!allFiles.length) {
    throw new Error(`Theme directory is empty: ${THEME_DIR}`);
  }

  const includedFiles = [];
  const excludedFiles = [];

  for (const file of allFiles) {
    const decision = shouldExcludeFile(file.relative, { size: file.size });

    if (decision.exclude) {
      excludedFiles.push({
        relative: normalizeRelative(file.relative),
        size: file.size,
        reason: decision.reason
      });
    } else {
      includedFiles.push(file);
    }
  }

  if (!includedFiles.length) {
    throw new Error("All theme files were excluded. Refine zip exclusion rules.");
  }

  const output = fs.createWriteStream(ARTIFACTS.themeZip);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      const zipBytes = archive.pointer();

      logStep("zip", `Created ${ARTIFACTS.themeZip} with ${includedFiles.length} files`);

      if (excludedFiles.length) {
        const preview = excludedFiles
          .slice(0, 15)
          .map(file => `${file.relative} (${Math.round(file.size / 1024)} KB, ${file.reason})`)
          .join("; ");

        logStep(
          "zip",
          `Excluded ${excludedFiles.length} files from theme.zip${preview ? `: ${preview}` : ""}`
        );
      }

      if (zipBytes > SHOPIFY_THEME_ZIP_LIMIT_BYTES) {
        logStep(
          "zip",
          `Warning: theme.zip is ${Math.round(zipBytes / (1024 * 1024))} MB, above Shopify's 50 MB theme upload limit`
        );
      } else {
        logStep(
          "zip",
          `theme.zip size is ${Math.round(zipBytes / 1024)} KB and within Shopify's 50 MB upload limit`
        );
      }

      resolve({
        zipPath: ARTIFACTS.themeZip,
        bytes: zipBytes,
        fileCount: includedFiles.length,
        excludedCount: excludedFiles.length,
        excludedFiles
      });
    });

    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);

    for (const file of includedFiles) {
      archive.file(file.absolute, { name: normalizeRelative(file.relative) });
    }

    archive.finalize();
  });
}

export async function run() {
  return buildZip();
}

if (process.argv[1]?.endsWith("build-theme-zip.js")) {
  run().catch(error => {
    console.error(`[zip] Build failed: ${error.message}`);
    process.exit(1);
  });
}