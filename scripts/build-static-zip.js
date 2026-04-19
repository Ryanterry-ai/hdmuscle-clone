import fs from "fs";
import path from "path";
import archiver from "archiver";

import {
  ARTIFACTS,
  STATIC_PUBLIC_DIR,
  logStep
} from "./pipeline-utils.js";

async function collectFiles(directory, root = directory) {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute);

    if (entry.isDirectory()) {
      const nested = await collectFiles(absolute, root);
      files.push(...nested);
      continue;
    }

    files.push({
      absolute,
      relative
    });
  }

  return files;
}

export async function buildStaticZip() {
  const output = fs.createWriteStream(ARTIFACTS.publicZip);
  const archive = archiver("zip", { zlib: { level: 9 } });

  const files = await collectFiles(STATIC_PUBLIC_DIR);

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      logStep("static-zip", `Created ${ARTIFACTS.publicZip} with ${files.length} files`);
      resolve();
    });

    archive.on("error", reject);
    output.on("error", reject);

    archive.pipe(output);

    for (const file of files) {
      archive.file(file.absolute, { name: file.relative.replace(/\\/g, "/") });
    }

    archive.finalize();
  });
}

export async function run() {
  return buildStaticZip();
}

if (process.argv[1]?.endsWith("build-static-zip.js")) {
  run().catch(error => {
    console.error(`[static-zip] Build failed: ${error.message}`);
    process.exit(1);
  });
}