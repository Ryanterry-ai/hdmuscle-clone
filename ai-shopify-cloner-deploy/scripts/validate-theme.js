import path from "path";

import fs from "fs-extra";

import {
  ARTIFACTS,
  THEME_DIR,
  logStep,
  readJson
} from "./pipeline-utils.js";

const REQUIRED_DIRECTORIES = ["layout", "templates", "sections", "assets", "config"];
const REQUIRED_FILES = [
  "layout/theme.liquid",
  "templates/index.liquid",
  "templates/product.liquid",
  "templates/collection.liquid",
  "sections/header.liquid",
  "sections/footer.liquid",
  "assets/theme.css",
  "config/settings_schema.json"
];

async function validateFile(filePath) {
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    throw new Error(`Missing required theme file: ${filePath}`);
  }

  const stats = await fs.stat(filePath);
  if (!stats.size) {
    throw new Error(`Theme file is empty: ${filePath}`);
  }
}

async function collectThemeFiles(directory) {
  const entries = await fs.readdir(directory);
  const results = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry);
    const stats = await fs.stat(absolutePath);

    if (stats.isDirectory()) {
      results.push(...(await collectThemeFiles(absolutePath)));
    } else {
      results.push(absolutePath);
    }
  }

  return results;
}

export async function validateTheme() {
  for (const directory of REQUIRED_DIRECTORIES) {
    const absolute = path.join(THEME_DIR, directory);
    const exists = await fs.pathExists(absolute);

    if (!exists) {
      throw new Error(`Missing required theme directory: ${absolute}`);
    }
  }

  for (const relativeFile of REQUIRED_FILES) {
    await validateFile(path.join(THEME_DIR, relativeFile));
  }

  const themeData = await readJson(ARTIFACTS.themeData, "theme data");
  if (!themeData.siteName) {
    throw new Error("Theme data is missing the generated site name.");
  }

  const files = await collectThemeFiles(THEME_DIR);
  const liquidFiles = files.filter(file => /\.(liquid|json|css)$/i.test(file));
  const themeAssets = new Set(
    (await fs.readdir(path.join(THEME_DIR, "assets"))).map(name => name.toLowerCase())
  );

  for (const file of liquidFiles) {
    const contents = await fs.readFile(file, "utf8");
    const matches = contents.matchAll(/'([^']+)' \| asset_url/g);

    for (const match of matches) {
      const assetName = match[1]?.toLowerCase();
      const liquidVariant = assetName ? `${assetName}.liquid` : "";
      if (
        assetName &&
        !themeAssets.has(assetName) &&
        !themeAssets.has(liquidVariant)
      ) {
        throw new Error(`Missing referenced theme asset '${match[1]}' in ${file}`);
      }
    }
  }

  logStep("validate", "Theme validation passed");
  return {
    valid: true,
    fileCount: files.length
  };
}

export async function run() {
  return validateTheme();
}

if (process.argv[1]?.endsWith("validate-theme.js")) {
  run().catch(error => {
    console.error(`[validate] Validation failed: ${error.message}`);
    process.exit(1);
  });
}
