import { downloadImages } from "../assets/download-real-images.js";

export async function run() {
  return downloadImages();
}

if (process.argv[1]?.endsWith("download-images.js")) {
  run().catch(error => {
    console.error(`[download] Asset download failed: ${error.message}`);
    process.exit(1);
  });
}
