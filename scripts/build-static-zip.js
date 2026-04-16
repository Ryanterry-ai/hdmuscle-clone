import fs from "fs";

import archiver from "archiver";

import {
  ARTIFACTS,
  STATIC_PUBLIC_DIR,
  logStep
} from "./pipeline-utils.js";

async function countFiles(directory) {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  let total = 0;

  for (const entry of entries) {
    const absolute = `${directory}\\${entry.name}`;
    if (entry.isDirectory()) {
      total += await countFiles(absolute);
    } else {
      total += 1;
    }
  }

  return total;
}

export async function buildStaticZip() {
  const exists = await fs.promises
    .stat(STATIC_PUBLIC_DIR)
    .then(stats => stats.isDirectory())
    .catch(() => false);

  if (!exists) {
    throw new Error(`Static export directory does not exist: ${STATIC_PUBLIC_DIR}`);
  }

  const fileCount = await countFiles(STATIC_PUBLIC_DIR);
  if (!fileCount) {
    throw new Error(`Static export directory is empty: ${STATIC_PUBLIC_DIR}`);
  }

  const output = fs.createWriteStream(ARTIFACTS.staticZip);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      logStep("static-zip", `Created ${ARTIFACTS.staticZip} with ${fileCount} files`);
      resolve({
        zipPath: ARTIFACTS.staticZip,
        bytes: archive.pointer(),
        fileCount
      });
    });

    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(STATIC_PUBLIC_DIR, false);
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
