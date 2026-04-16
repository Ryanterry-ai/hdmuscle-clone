import { chromium } from "playwright";

export async function crawlWebsite(startUrl) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const visited = new Set();
  const queue = [startUrl];
  const pages = [];

  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) continue;

    visited.add(url);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

      const data = await page.evaluate(() => {
        return {
          url: location.href,

          // UNIVERSAL CAPTURE (NO ASSUMPTIONS)
          title: document.title,
          html: document.documentElement.outerHTML,

          links: Array.from(document.querySelectorAll("a"))
            .map(a => a.href)
            .filter(Boolean),

          images: Array.from(document.querySelectorAll("img"))
            .map(img => img.src)
            .filter(Boolean)
        };
      });

      pages.push(data);

      for (const link of data.links) {
        if (!visited.has(link)) queue.push(link);
      }

    } catch (err) {
      console.log("Skip failed URL:", url);
    }
  }

  await browser.close();
  return pages;
}
