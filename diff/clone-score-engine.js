// diff/clone-score-engine.js

import fs from "fs-extra";
import { runVisualDiff } from "./visual-diff-engine.js";

export async function calculateCloneScore(original, clone) {
  const diff = await runVisualDiff(original, clone);

  const accuracy =
    ((diff.totalPixels - diff.mismatch) / diff.totalPixels) * 100;

  const report = {
    cloneAccuracy: accuracy.toFixed(2),
    mismatchPixels: diff.mismatch,
    totalPixels: diff.totalPixels,
    screenshots: {
      original: diff.original,
      clone: diff.clone,
      diff: diff.diff
    },
    timestamp: new Date().toISOString()
  };

  await fs.writeJSON(
    "./output/diff-report.json",
    report,
    { spaces: 2 }
  );

  console.log(
    `🎯 Clone Accuracy Score: ${report.cloneAccuracy}%`
  );

  return report;
}

export async function validateCloneQuality(original, clone) {
  const report = await calculateCloneScore(original, clone);

  if (report.cloneAccuracy >= 95) {
    console.log("✅ Pixel Perfect Clone");
  } else if (report.cloneAccuracy >= 85) {
    console.log("⚠️ Minor UI Differences");
  } else {
    console.log("❌ Clone Quality Low");
  }

  return report;
}
