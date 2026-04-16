// diff/visual-diff-engine.js

import fs from "fs-extra";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export async function captureScreenshot(url, output) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 900
    }
  });

  await page.goto(url, {
    waitUntil: "networkidle"
  });

  await page.screenshot({
    path: output,
    fullPage: true
  });

  await browser.close();
}

export async function compareScreenshots(original, clone, diffOutput) {
  const img1 = PNG.sync.read(fs.readFileSync(original));
  const img2 = PNG.sync.read(fs.readFileSync(clone));

  const { width, height } = img1;

  const diff = new PNG({ width, height });

  const mismatch = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  fs.writeFileSync(diffOutput, PNG.sync.write(diff));

  return {
    mismatch,
    totalPixels: width * height
  };
}

export async function runVisualDiff(originalUrl, cloneUrl) {
  await fs.ensureDir("./output/diff");

  const original = "./output/diff/original.png";
  const clone = "./output/diff/clone.png";
  const diff = "./output/diff/diff.png";

  console.log("📸 Capturing Original...");
  await captureScreenshot(originalUrl, original);

  console.log("📸 Capturing Clone...");
  await captureScreenshot(cloneUrl, clone);

  console.log("🔍 Comparing...");

  const result = await compareScreenshots(original, clone, diff);

  return {
    ...result,
    original,
    clone,
    diff
  };
}
