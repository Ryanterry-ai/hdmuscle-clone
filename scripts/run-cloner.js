import { run as crawl } from "./crawl-site.js";
import { readCliUrl } from "./pipeline-utils.js";

export async function run(url = readCliUrl()) {
  if (!url) {
    throw new Error("Please provide a URL. Example: node scripts/run-cloner.js https://hdmuscle.com");
  }

  return crawl(url);
}

if (process.argv[1]?.endsWith("run-cloner.js")) {
  run().catch(error => {
    console.error(`[run-cloner] Failed: ${error.message}`);
    process.exit(1);
  });
}
