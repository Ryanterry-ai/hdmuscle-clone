import {
  ARTIFACTS,
  logStep,
  readJson,
  writeJson
} from "./pipeline-utils.js";

function inferPageType(page) {
  const url = page.normalizedUrl || page.url || "";
  const text = `${page.title || ""} ${page.text || ""}`.toLowerCase();
  const reasons = [];
  let type = "content";
  let confidence = 0.55;

  if (new URL(url).pathname === "/") {
    type = "homepage";
    confidence = 0.99;
    reasons.push("root-path");
    return { type, confidence, reasons };
  }

  if (url.includes("/blogs/") || url.includes("/articles/")) {
    type = "article";
    confidence = 0.88;
    reasons.push("article-url");
    return { type, confidence, reasons };
  }

  if (url.includes("/collections/")) {
    type = "collection";
    confidence = 0.96;
    reasons.push("collection-url");
    return { type, confidence, reasons };
  }

  if (url.includes("/products/") || page.typeHint === "product") {
    type = "product";
    confidence = 0.97;
    reasons.push("product-url");
    return { type, confidence, reasons };
  }

  if (page.componentHints?.hasProductForm && !url.includes("/collections/")) {
    type = "product";
    confidence = 0.83;
    reasons.push("product-form");
    return { type, confidence, reasons };
  }

  if (
    /privacy|refund|return|shipping|terms|policy/.test(url) ||
    /privacy|refund|return|shipping|terms|policy/.test(text)
  ) {
    type = "policy";
    confidence = 0.9;
    reasons.push("policy-signals");
    return { type, confidence, reasons };
  }

  if (
    page.componentHints?.hasProductGrid &&
    page.collectionCards?.length > 0 &&
    !page.componentHints?.hasProductForm
  ) {
    type = "collection";
    confidence = 0.78;
    reasons.push("collection-grid");
    return { type, confidence, reasons };
  }

  if (page.componentHints?.hasHero || page.sections?.length > 3) {
    type = "landing";
    confidence = 0.7;
    reasons.push("marketing-layout");
    return { type, confidence, reasons };
  }

  if (/contact|about|faq/.test(url) || /contact|about|faq/.test(text)) {
    type = "content";
    confidence = 0.75;
    reasons.push("content-signals");
    return { type, confidence, reasons };
  }

  reasons.push("default-content");
  return { type, confidence, reasons };
}

export async function classifyPages(crawlData) {
  const sourceData = crawlData || (await readJson(ARTIFACTS.crawlResults, "crawl results"));
  const pages = (sourceData.pages || []).map(page => {
    const classification = inferPageType(page);

    return {
      url: page.normalizedUrl || page.url,
      title: page.title || "",
      type: classification.type,
      confidence: classification.confidence,
      reasons: classification.reasons,
      typeHint: page.typeHint || ""
    };
  });

  const summary = pages.reduce((accumulator, page) => {
    accumulator[page.type] = (accumulator[page.type] || 0) + 1;
    return accumulator;
  }, {});

  const result = {
    createdAt: new Date().toISOString(),
    totalPages: pages.length,
    summary,
    pages
  };

  await writeJson(ARTIFACTS.pageClassification, result);
  logStep("classify", `Classified ${pages.length} pages`);

  return result;
}

export async function run() {
  return classifyPages();
}

if (process.argv[1]?.endsWith("classify-pages.js")) {
  run().catch(error => {
    console.error(`[classify] Classification failed: ${error.message}`);
    process.exit(1);
  });
}
