import { chromium } from "playwright";

const DEFAULT_TIMEOUT = Number(process.env.CLONER_PAGE_TIMEOUT_MS || 90000);

function normalizeUrlSafe(value, baseUrl = "") {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

function dedupe(values = []) {
  return [...new Set((values || []).filter(Boolean))];
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function snippet(value, max = 500) {
  const text = cleanText(value);
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function getMappedPages(siteMap) {
  if (Array.isArray(siteMap)) return siteMap;
  if (Array.isArray(siteMap?.pages)) return siteMap.pages;
  return [];
}

export async function humanCrawl(siteMap) {
  const mappedPages = getMappedPages(siteMap);
  const startUrl =
    siteMap?.startUrl ||
    mappedPages[0]?.normalizedUrl ||
    mappedPages[0]?.url ||
    "";

  if (!mappedPages.length) {
    throw new Error("humanCrawl received no mapped pages to crawl.");
  }

  console.log(`[crawl] Starting human crawl for ${mappedPages.length} pages`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 2200 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  });

  const page = await context.newPage();
  const visited = new Set();
  const results = [];
  const failures = [];

  for (let index = 0; index < mappedPages.length; index += 1) {
    const mapped = mappedPages[index];
    const candidateUrl =
      mapped?.normalizedUrl || mapped?.url || normalizeUrlSafe(mapped, startUrl);

    if (!candidateUrl || visited.has(candidateUrl)) continue;
    visited.add(candidateUrl);

    console.log(`[crawl] (${results.length + 1}/${mappedPages.length}) ${candidateUrl}`);

    try {
      await page.goto(candidateUrl, {
        waitUntil: "domcontentloaded",
        timeout: DEFAULT_TIMEOUT,
      });

      try {
        await page.waitForLoadState("networkidle", { timeout: 12000 });
      } catch {
        // non-fatal
      }

      await page.waitForTimeout(1200);

      // gentle auto-scroll to trigger lazy media, sticky headers, carousels, etc.
      await page.evaluate(async () => {
        await new Promise(resolve => {
          let total = 0;
          const step = 700;
          const maxScroll = Math.max(
            document.body?.scrollHeight || 0,
            document.documentElement?.scrollHeight || 0,
            2400
          );

          const timer = setInterval(() => {
            window.scrollBy(0, step);
            total += step;

            if (total >= maxScroll) {
              clearInterval(timer);
              resolve();
            }
          }, 140);
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        window.scrollTo(0, 0);
      });

      const extracted = await page.evaluate(() => {
        const toArray = value => Array.from(value || []);
        const uniq = values => [...new Set((values || []).filter(Boolean))];
        const clean = value => String(value || "").replace(/\s+/g, " ").trim();
        const short = (value, max = 500) => {
          const text = clean(value);
          return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
        };

        const absolute = value => {
          try {
            return new URL(value, location.href).toString();
          } catch {
            return "";
          }
        };

        const collectInlineStyleUrls = () => {
          const urls = [];

          for (const el of toArray(document.querySelectorAll("[style]"))) {
            const style = el.getAttribute("style") || "";
            for (const match of style.matchAll(/url\(["']?(.*?)["']?\)/g)) {
              if (match[1] && !match[1].startsWith("data:")) {
                urls.push(absolute(match[1]));
              }
            }
          }

          return uniq(urls);
        };

        const collectBackgroundImages = () => {
          const urls = [];
          for (const el of toArray(document.querySelectorAll("*"))) {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (!bg || bg === "none") continue;
            for (const match of bg.matchAll(/url\(["']?(.*?)["']?\)/g)) {
              if (match[1] && !match[1].startsWith("data:")) {
                urls.push(absolute(match[1]));
              }
            }
          }
          return uniq(urls);
        };

        const attrsToObject = node => {
          const output = {};
          if (!node?.attributes) return output;
          for (const attr of Array.from(node.attributes)) {
            output[attr.name] = attr.value;
          }
          return output;
        };

        const styleTags = toArray(document.querySelectorAll("style")).map((node, i) => ({
          index: i,
          cssText: node.textContent || "",
        }));

        const navigation = toArray(
          document.querySelectorAll(
            "header a[href], nav a[href], [role='navigation'] a[href]"
          )
        )
          .map(anchor => ({
            url: anchor.href,
            text: clean(anchor.textContent),
            ariaLabel: anchor.getAttribute("aria-label") || "",
          }))
          .filter(item => item.url && (item.text || item.ariaLabel));

        const buttons = toArray(document.querySelectorAll("button, a[role='button'], .button, .btn"))
          .map(node => ({
            text: clean(node.textContent),
            html: (node.outerHTML || "").slice(0, 1200),
          }))
          .filter(item => item.text || item.html);

        const headings = toArray(document.querySelectorAll("h1,h2,h3,h4,h5,h6"))
          .slice(0, 80)
          .map(node => ({
            level: node.tagName.toLowerCase(),
            text: clean(node.textContent),
          }))
          .filter(item => item.text);

        const forms = toArray(document.querySelectorAll("form")).map((form, index) => ({
          index,
          action: form.getAttribute("action") || "",
          method: (form.getAttribute("method") || "get").toLowerCase(),
          hasProductInput: !!form.querySelector("input[name='id'], [name='id'][type='hidden']"),
          htmlSnippet: (form.outerHTML || "").slice(0, 4000),
        }));

        const productCards = toArray(
          document.querySelectorAll(
            "[data-product-id], [data-product-card], .product-card, .card-product, a[href*='/products/']"
          )
        )
          .slice(0, 50)
          .map(card => ({
            title:
              clean(
                card.querySelector("h1,h2,h3,h4,h5,h6,.title,.card-title,.product-title")?.textContent ||
                  card.textContent
              ) || "",
            url:
              card.getAttribute("href")
                ? absolute(card.getAttribute("href"))
                : absolute(card.querySelector("a[href]")?.getAttribute("href") || ""),
            image:
              card.querySelector("img")?.currentSrc ||
              card.querySelector("img")?.src ||
              "",
            htmlSnippet: (card.outerHTML || "").slice(0, 3000),
          }));

        const collectionCards = toArray(
          document.querySelectorAll(
            ".collection-card, [data-collection], a[href*='/collections/']"
          )
        )
          .slice(0, 50)
          .map(card => ({
            title:
              clean(
                card.querySelector("h1,h2,h3,h4,h5,h6,.title,.card-title,.collection-title")?.textContent ||
                  card.textContent
              ) || "",
            url:
              card.getAttribute("href")
                ? absolute(card.getAttribute("href"))
                : absolute(card.querySelector("a[href]")?.getAttribute("href") || ""),
            image:
              card.querySelector("img")?.currentSrc ||
              card.querySelector("img")?.src ||
              "",
            htmlSnippet: (card.outerHTML || "").slice(0, 3000),
          }));

        const main = document.querySelector("main");
        const blockRoots = main
          ? toArray(main.children)
          : toArray(document.body?.children || []).filter(
              node =>
                !["SCRIPT", "NOSCRIPT"].includes(node.tagName) &&
                node.tagName !== "HEADER" &&
                node.tagName !== "FOOTER"
            );

        const mainBlocks = blockRoots
          .slice(0, 80)
          .map((node, index) => ({
            index,
            tag: node.tagName.toLowerCase(),
            id: node.id || "",
            className: node.className || "",
            heading: clean(node.querySelector("h1,h2,h3,h4,h5,h6")?.textContent || ""),
            textSnippet: short(node.textContent, 700),
            hasProductLinks: !!node.querySelector("a[href*='/products/']"),
            hasCollectionLinks: !!node.querySelector("a[href*='/collections/']"),
            hasForm: !!node.querySelector("form"),
            html: node.outerHTML || "",
          }));

        const appEmbeds = toArray(
          document.querySelectorAll(
            [
              "[class*='yotpo']",
              "[id*='yotpo']",
              "[class*='fastbundle']",
              "[id*='fastbundle']",
              "[class*='subscription']",
              "[id*='subscription']",
              "[class*='restock']",
              "[id*='restock']",
              "[class*='countdown']",
              "[id*='countdown']",
              "[class*='judge']",
              "[id*='judge']",
              "[data-reviews]",
              "[data-widget]"
            ].join(",")
          )
        )
          .slice(0, 40)
          .map((node, index) => ({
            index,
            tag: node.tagName.toLowerCase(),
            id: node.id || "",
            className: node.className || "",
            html: (node.outerHTML || "").slice(0, 3500),
          }));

        const inlineJson = toArray(
          document.querySelectorAll("script[type='application/json'], script[type='application/ld+json']")
        ).map((script, index) => ({
          index,
          type: script.type,
          content: script.textContent || "",
        }));

        const styles = uniq(
          toArray(
            document.querySelectorAll("link[rel='stylesheet'][href], link[as='style'][href]")
          ).map(node => node.href)
        );

        const scripts = uniq(
          toArray(document.querySelectorAll("script[src]")).map(node => node.src)
        );

        const fonts = uniq(
          [
            ...toArray(
              document.querySelectorAll("link[rel='preload'][href][as='font'], link[href*='font']")
            ).map(node => node.href),
            ...toArray(document.querySelectorAll("style")).flatMap(node =>
              Array.from((node.textContent || "").matchAll(/url\(["']?(.*?)["']?\)/g))
                .map(match => absolute(match[1]))
                .filter(Boolean)
            ),
          ]
        );

        const images = uniq(
          toArray(document.querySelectorAll("img[src], source[srcset], [data-src], [data-srcset]"))
            .flatMap(node => {
              const srcset =
                node.getAttribute("srcset") ||
                node.getAttribute("data-srcset") ||
                "";
              const sources = srcset
                ? srcset
                    .split(",")
                    .map(item => item.trim().split(/\s+/)[0])
                    .filter(Boolean)
                : [];

              return [
                node.getAttribute("src"),
                node.getAttribute("data-src"),
                ...sources,
              ]
                .filter(Boolean)
                .map(absolute);
            })
        );

        const videos = uniq(
          toArray(document.querySelectorAll("video[src], source[src]"))
            .map(node => absolute(node.getAttribute("src")))
            .filter(Boolean)
        );

        const icons = uniq(
          toArray(document.querySelectorAll("link[rel*='icon'][href]")).map(node => node.href)
        );

        const meta = toArray(document.querySelectorAll("meta")).map(node => ({
          name: node.getAttribute("name"),
          property: node.getAttribute("property"),
          content: node.getAttribute("content"),
        }));

        const links = toArray(document.querySelectorAll("a[href]")).map(anchor => ({
          url: anchor.href,
          text: clean(anchor.textContent),
          ariaLabel: anchor.getAttribute("aria-label") || "",
        }));

        const rootStyle = getComputedStyle(document.documentElement);
        const cssVariables = {};
        for (const key of Array.from(rootStyle)) {
          if (String(key).startsWith("--")) {
            cssVariables[key] = rootStyle.getPropertyValue(key).trim();
          }
        }

        const bodyClass = document.body?.className || "";
        const htmlClass = document.documentElement?.className || "";

        return {
          finalUrl: location.href,
          title: document.title || "",
          canonicalUrl: document.querySelector("link[rel='canonical']")?.href || "",
          html: document.documentElement.outerHTML,
          text: clean(document.body?.innerText || ""),
          meta,
          links,
          navigation,
          headings,
          buttons,
          forms,
          sections: mainBlocks.map(block => ({
            index: block.index,
            tag: block.tag,
            id: block.id,
            className: block.className,
            heading: block.heading,
            textSnippet: block.textSnippet,
            htmlSnippet: block.html.slice(0, 2500),
          })),
          productCards,
          collectionCards,
          inlineJson,
          appEmbeds,
          assets: {
            images,
            backgroundImages: collectBackgroundImages(),
            inlineStyleUrls: collectInlineStyleUrls(),
            styles,
            scripts,
            fonts,
            videos,
            media: uniq([...images, ...videos]),
            icons,
          },
          dom: {
            htmlAttrs: attrsToObject(document.documentElement),
            bodyAttrs: attrsToObject(document.body),
            htmlClass,
            bodyClass,
            headerHtml: document.querySelector("header, [role='banner']")?.outerHTML || "",
            footerHtml: document.querySelector("footer, [role='contentinfo']")?.outerHTML || "",
            mainHtml: document.querySelector("main")?.outerHTML || "",
            mainBlocks,
            inlineStyles: styleTags,
            cssVariables,
          },
          componentHints: {
            hasHeader: !!document.querySelector("header, [role='banner']"),
            hasFooter: !!document.querySelector("footer, [role='contentinfo']"),
            hasMegaMenu:
              !!document.querySelector(".mega-menu, [data-mega-menu], .site-nav__dropdown") ||
              navigation.length >= 8,
            hasHero:
              !!document.querySelector(".hero, .banner, [data-hero], main section:first-of-type h1"),
            hasProductGrid: productCards.length >= 2,
            hasCollectionGrid: collectionCards.length >= 2,
            hasProductForm: forms.some(form => form.hasProductInput),
          },
          animationHints: uniq([
            ...toArray(
              document.querySelectorAll(
                "[data-aos], [data-animation], [data-animate], [class*='animate'], [class*='motion']"
              )
            ).map(node => node.getAttribute("class") || node.getAttribute("data-aos") || "animation"),
            ...scripts.filter(src => /gsap|framer|motion|lottie|anime|swiper|slick/i.test(src)),
          ]),
        };
      });

      results.push({
        url: candidateUrl,
        normalizedUrl: normalizeUrlSafe(extracted.finalUrl || candidateUrl, candidateUrl),
        title: extracted.title,
        canonicalUrl: extracted.canonicalUrl,
        html: extracted.html,
        text: extracted.text,
        meta: extracted.meta || [],
        links: extracted.links || [],
        navigation: extracted.navigation || [],
        headings: extracted.headings || [],
        buttons: extracted.buttons || [],
        forms: extracted.forms || [],
        sections: extracted.sections || [],
        productCards: extracted.productCards || [],
        collectionCards: extracted.collectionCards || [],
        inlineJson: extracted.inlineJson || [],
        appEmbeds: extracted.appEmbeds || [],
        assets: extracted.assets || {},
        dom: extracted.dom || {},
        componentHints: extracted.componentHints || {},
        animationHints: extracted.animationHints || [],
      });
    } catch (error) {
      failures.push({
        url: candidateUrl,
        message: error.message,
      });
      console.log(`[crawl] Failed ${candidateUrl}: ${error.message}`);
    }
  }

  await browser.close();

  return {
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    pageCount: results.length,
    failureCount: failures.length,
    startUrl,
    pages: results,
    failures,
  };
}