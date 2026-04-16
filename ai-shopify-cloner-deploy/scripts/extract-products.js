import * as cheerio from "cheerio";
import fs from "fs";

import {
  ARTIFACTS,
  ensureBaseOutputStructure,
  logStep,
  readJson,
  toCsv,
  toHandle,
  writeJson
} from "./pipeline-utils.js";

const DEFAULT_USD_TO_INR_RATE = 93.404;
const DEFAULT_RATE_FETCHED_AT = "2026-04-15T12:41:00";
const DEFAULT_RATE_SOURCE =
  "https://www.exchangerates.org.uk/Dollars-to-Rupees-currency-conversion-page.html";

function uniq(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function getPriceConversionConfig() {
  const targetCurrency = String(process.env.CLONER_TARGET_CURRENCY || "INR").toUpperCase();
  const sourceCurrency = String(process.env.CLONER_SOURCE_CURRENCY || "USD").toUpperCase();
  const configuredRate = Number(process.env.USD_TO_INR_RATE || DEFAULT_USD_TO_INR_RATE);

  return {
    enabled: sourceCurrency === "USD" && targetCurrency === "INR" && Number.isFinite(configuredRate),
    sourceCurrency,
    targetCurrency,
    rate: configuredRate,
    fetchedAt: process.env.USD_TO_INR_FETCHED_AT || DEFAULT_RATE_FETCHED_AT,
    sourceUrl: process.env.USD_TO_INR_SOURCE_URL || DEFAULT_RATE_SOURCE
  };
}

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function collectJsonCandidates(page) {
  const parsed = [];
  const scripts = [...(page.jsonLd || []), ...(page.inlineJson || [])];

  for (const script of scripts) {
    const value = parseJson(script.content);

    if (!value) {
      continue;
    }

    if (Array.isArray(value)) {
      parsed.push(...value);
      continue;
    }

    parsed.push(value);
  }

  return parsed;
}

function findNestedProductObject(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (
    value["@type"] === "Product" ||
    (value.title && value.variants && Array.isArray(value.variants)) ||
    (value.product && typeof value.product === "object")
  ) {
    return value.product || value;
  }

  for (const nested of Object.values(value)) {
    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = findNestedProductObject(item);
        if (found) return found;
      }
      continue;
    }

    const found = findNestedProductObject(nested);
    if (found) return found;
  }

  return null;
}

function parsePrice(value) {
  const text = String(value || "").replace(/,/g, "");
  const match = text.match(/-?\d+(?:\.\d{1,2})?/);
  return match ? Number(match[0]) : null;
}

function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

function convertPrice(value, sourceCurrency, conversion) {
  if (value == null || !conversion.enabled) {
    return value;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  if (String(sourceCurrency || "").toUpperCase() === conversion.targetCurrency) {
    return roundMoney(numericValue);
  }

  return roundMoney(numericValue * conversion.rate);
}

function extractDescription($) {
  const selectors = [
    "[data-product-description]",
    ".product__description",
    ".product-description",
    ".rte",
    "main article",
    "main"
  ];

  for (const selector of selectors) {
    const html = $(selector).first().html();
    if (html?.trim()) {
      return html.trim();
    }
  }

  return "";
}

function extractVariantOptions($) {
  const variants = [];

  $("form select[name*='options'], form input[name*='options'][type='radio']:checked")
    .slice(0, 20)
    .each((_, input) => {
      const element = $(input);
      const name = element.attr("name");
      const value = element.val();

      if (!name || !value) {
        return;
      }

      variants.push({
        title: String(value).trim(),
        sku: "",
        price: null,
        available: true
      });
    });

  return uniq(
    variants
      .filter(variant => variant.title && variant.title.toLowerCase() !== "default title")
      .map(variant => variant.title)
  ).map(title => ({
    title,
    sku: "",
    price: null,
    available: true
  }));
}

function normalizeProductVariants(productSource, $) {
  const sourceVariants = Array.isArray(productSource.variants)
    ? productSource.variants
    : [];

  const normalized = sourceVariants
    .map(variant => ({
      id: variant.id || "",
      title: String(variant.title || variant.name || "").trim(),
      sku: variant.sku || "",
      price: parsePrice(variant.price),
      available: variant.available ?? null
    }))
    .filter(variant => variant.title && variant.title.toLowerCase() !== "default title");

  if (normalized.length) {
    return uniq(normalized.map(variant => variant.title)).map(title => {
      const match = normalized.find(variant => variant.title === title);
      return match;
    });
  }

  return extractVariantOptions($);
}

function sanitizeProductImages(images = [], productUrl = "") {
  return uniq(
    images.filter(image => {
      if (!image || typeof image !== "string") {
        return false;
      }

      if (!/^https?:\/\//i.test(image)) {
        return false;
      }

      return image !== productUrl;
    })
  );
}

function decodeMojibakeText(value) {
  const input = String(value || "");

  if (!input) {
    return "";
  }

  const looksMojibake = /[ÃÂâ€™â€œâ€â€“â€”â€¦]/.test(input);

  if (!looksMojibake) {
    return input;
  }

  try {
    return Buffer.from(input, "latin1").toString("utf8");
  } catch {
    return input;
  }
}

function cleanCollectionText(value) {
  return decodeMojibakeText(value)
    .replace(/\u00a0/g, " ")
    .replace(/Â/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+-\s+HD MUSCLE$/i, "")
    .trim();
}

function isCollectionFilterBoilerplate(value) {
  const text = cleanCollectionText(value).toLowerCase();

  return (
    text.includes("filters sort by") ||
    text.includes("availability in stock") ||
    text.includes("clear all apply")
  );
}

function buildProductRecord(page, conversion) {
  const $ = cheerio.load(page.html || "");
  const jsonCandidates = collectJsonCandidates(page);
  const jsonLdProduct = jsonCandidates.find(item => item?.["@type"] === "Product");
  const embeddedProduct = jsonCandidates
    .map(candidate => findNestedProductObject(candidate))
    .find(Boolean);

  const productSource = jsonLdProduct || embeddedProduct || {};
  const productUrl = page.normalizedUrl || page.url;
  const title =
    productSource.name ||
    productSource.title ||
    $("h1").first().text().trim() ||
    page.title ||
    "";
  const images = sanitizeProductImages([
    ...(Array.isArray(productSource.image)
      ? productSource.image
      : productSource.image
        ? [productSource.image]
        : []),
    ...(page.assets?.images || []).slice(0, 12),
    ...(page.productCards || []).map(card => card.image)
  ], productUrl);
  const offers = Array.isArray(productSource.offers)
    ? productSource.offers[0]
    : productSource.offers || {};
  const priceCandidates = [
    offers.price,
    offers.lowPrice,
    productSource.price,
    $(
      "[data-price], .price-item, .price, .product-price, .money"
    ).first().text()
  ];
  const price = priceCandidates.map(parsePrice).find(value => value != null) ?? null;
  const compareAtPrice = parsePrice(
    $(".price--compare, .compare-at-price, s .money").first().text()
  );
  const sourceCurrency =
    offers.priceCurrency ||
    $("meta[property='product:price:currency']").attr("content") ||
    conversion.sourceCurrency;

  return {
    url: productUrl,
    handle: toHandle(productSource.handle || title || new URL(productUrl).pathname),
    title,
    vendor:
      productSource.brand?.name ||
      productSource.vendor ||
      $(".product-vendor, [data-product-vendor]").first().text().trim(),
    type: productSource.category || "",
    descriptionHtml:
      productSource.description || extractDescription($) || "",
    price: convertPrice(price, sourceCurrency, conversion),
    compareAtPrice: convertPrice(compareAtPrice, sourceCurrency, conversion),
    currency: conversion.enabled ? conversion.targetCurrency : sourceCurrency || "",
    sourceCurrency,
    availability: offers.availability
      ? String(offers.availability)
      : $("form [name='id']").length > 0
        ? "available"
        : "",
    images,
    variants: normalizeProductVariants(productSource, $).map(variant => ({
      ...variant,
      price: convertPrice(variant.price, sourceCurrency, conversion)
    })),
    breadcrumbs: page.breadcrumbs || [],
    sourceType: page.typeHint || "",
    extractedFrom: "page"
  };
}

function isLikelyProductPage(page, pageClassification) {
  const url = page.normalizedUrl || page.url || "";
  const pathname = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return "";
    }
  })();
  const classified = (pageClassification?.pages || []).find(
    item => item.url === url && item.type === "product"
  );

  return (
    pathname !== "/404" &&
    pathname.includes("/products/") ||
    !!classified ||
    page.typeHint === "product"
  );
}

function isLikelyCollectionPage(page, pageClassification) {
  const url = page.normalizedUrl || page.url || "";
  const classified = (pageClassification?.pages || []).find(
    item => item.url === url && item.type === "collection"
  );

  return (
    url.includes("/collections/") ||
    (!!classified && url.includes("/collections/")) ||
    (page.typeHint === "collection" && url.includes("/collections/")) ||
    (page.collectionCards?.length > 0 && url.includes("/collections/"))
  );
}

function extractCollectionDescription(page) {
  const $ = cheerio.load(page.html || "");
  const mainParagraph = $("main p")
    .map((_, element) => cleanCollectionText($(element).text()))
    .get()
    .find(text => text && !/^filters\b/i.test(text) && !isCollectionFilterBoilerplate(text) && text.length > 24);
  const sectionSnippet = cleanCollectionText(
    page.sections?.find(section => section.textSnippet)?.textSnippet || ""
  );
  const headingSnippet = page.headings
    ?.slice(1)
    .map(item => cleanCollectionText(item.text))
    .find(text => text && !isCollectionFilterBoilerplate(text));
  const metaDescription = cleanCollectionText($("meta[name='description']").attr("content"));

  return (
    mainParagraph ||
    (!isCollectionFilterBoilerplate(sectionSnippet) ? sectionSnippet : "") ||
    headingSnippet ||
    (!isCollectionFilterBoilerplate(metaDescription) ? metaDescription : "") ||
    ""
  );
}

function extractCollectionProductUrls(page) {
  const pageUrl = page.normalizedUrl || page.url;
  const $ = cheerio.load(page.html || "");
  const mainLinks = uniq(
    $("main a[href*='/products/']")
      .map((_, element) => {
        const href = $(element).attr("href");

        if (!href) {
          return "";
        }

        try {
          return new URL(href, pageUrl).toString();
        } catch {
          return "";
        }
      })
      .get()
      .filter(link => link.includes("/products/"))
  );

  if (mainLinks.length) {
    return mainLinks;
  }

  return uniq(
    (page.productCards || [])
      .map(card => card.url)
      .filter(link => link?.includes("/products/"))
  );
}

function buildCollectionRecord(page, pageClassification) {
  const url = page.normalizedUrl || page.url;
  const $ = cheerio.load(page.html || "");
  const pathname = new URL(url).pathname;
  const handle = toHandle(pathname.split("/").filter(Boolean).pop() || page.title || "collection");
  const productUrls = extractCollectionProductUrls(page);
  const classified = (pageClassification?.pages || []).find(item => item.url === url);

  return {
    url,
    handle,
    title: cleanCollectionText(
      $("meta[property='og:title']").attr("content") ||
      $("main h1").first().text() ||
      page.headings?.[0]?.text ||
      page.title ||
      handle
    ),
    description: cleanCollectionText(extractCollectionDescription(page)),
    image:
      $("meta[property='og:image']").attr("content") ||
      page.assets?.images?.find(image => image.includes("/collections/")) ||
      page.assets?.images?.[0] ||
      page.collectionCards?.[0]?.image ||
      "",
    productUrls,
    productCountHint: productUrls.length,
    classification: classified?.type || "collection"
  };
}

function productRowsForCsv(product) {
  const variants = Array.isArray(product.variants) && product.variants.length
    ? product.variants
    : [{ title: "Default Title", sku: "", price: product.price, available: true }];
  const imageRows = product.images?.length ? product.images : [""];
  const rows = [];

  variants.forEach((variant, variantIndex) => {
    imageRows.forEach((image, imageIndex) => {
      const isPrimaryRow = variantIndex === 0 && imageIndex === 0;

      rows.push({
        Handle: product.handle,
        Title: isPrimaryRow ? product.title : "",
        "Body (HTML)": isPrimaryRow ? product.descriptionHtml : "",
        Vendor: isPrimaryRow ? product.vendor || "" : "",
        Type: isPrimaryRow ? product.type || "" : "",
        Tags: isPrimaryRow
          ? uniq([
              product.sourceType,
              ...(product.breadcrumbs || []).map(item => toHandle(item.text || ""))
            ]).filter(Boolean).join(", ")
          : "",
        Published: "TRUE",
        "Option1 Name": "Title",
        "Option1 Value": variant.title || "Default Title",
        "Variant SKU": variant.sku || "",
        "Variant Grams": "",
        "Variant Inventory Tracker": "",
        "Variant Inventory Qty": "",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": variant.price ?? product.price ?? "",
        "Variant Compare At Price": product.compareAtPrice ?? "",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Variant Barcode": "",
        "Image Src": image,
        "Image Position": image ? imageIndex + 1 : "",
        "Image Alt Text": isPrimaryRow ? product.title : "",
        "Gift Card": "FALSE",
        Status: "active"
      });
    });
  });

  return rows;
}

function productRowsForAdminImport(product) {
  return [
    {
      Handle: product.handle,
      Title: product.title,
      "Body (HTML)": product.descriptionHtml,
      Vendor: product.vendor || "",
      Type: product.type || "",
      Tags: uniq([
        product.sourceType,
        ...(product.breadcrumbs || []).map(item => toHandle(item.text || ""))
      ]).filter(Boolean).join(", "),
      Published: "TRUE",
      "Option1 Name": "Title",
      "Option1 Value": "Default Title",
      "Variant SKU": "",
      "Variant Grams": "",
      "Variant Inventory Tracker": "",
      "Variant Inventory Qty": "",
      "Variant Inventory Policy": "deny",
      "Variant Fulfillment Service": "manual",
      "Variant Price": product.price ?? "",
      "Variant Compare At Price": product.compareAtPrice ?? "",
      "Variant Requires Shipping": "TRUE",
      "Variant Taxable": "TRUE",
      "Variant Barcode": "",
      "Image Src": "",
      "Image Position": "",
      "Image Alt Text": "",
      "Gift Card": "FALSE",
      Status: "active"
    }
  ];
}

function collectionRowsForCsv(collection) {
  if (!collection.productUrls.length) {
    return [
      {
        Handle: collection.handle,
        Title: collection.title,
        Description: collection.description,
        "Image Src": collection.image,
        "Product URL": "",
        "Sort Order": "manual",
        Published: "TRUE"
      }
    ];
  }

  return collection.productUrls.map((productUrl, index) => ({
    Handle: collection.handle,
    Title: index === 0 ? collection.title : "",
    Description: index === 0 ? collection.description : "",
    "Image Src": index === 0 ? collection.image : "",
    "Product URL": productUrl,
    "Sort Order": "manual",
    Published: "TRUE"
  }));
}

export async function extractProducts(crawlData) {
  const sourceData = crawlData || (await readJson(ARTIFACTS.crawlResults, "crawl results"));
  await ensureBaseOutputStructure();
  const conversion = getPriceConversionConfig();
  const pageClassification = await readJson(
    ARTIFACTS.pageClassification,
    "page classification"
  ).catch(() => ({ pages: [] }));
  const products = [];
  const collections = [];
  const seen = new Set();
  const seenCollections = new Set();

  for (const page of sourceData.pages || []) {
    if (!isLikelyProductPage(page, pageClassification)) {
      if (isLikelyCollectionPage(page, pageClassification)) {
        const collection = buildCollectionRecord(page, pageClassification);
        if (!seenCollections.has(collection.url)) {
          seenCollections.add(collection.url);
          collections.push(collection);
        }
      }
      continue;
    }

    const record = buildProductRecord(page, conversion);

    if (
      !record.title ||
      seen.has(record.url) ||
      /(^|\b)not found(\b|$)/i.test(record.title) ||
      new URL(record.url).pathname === "/404"
    ) {
      continue;
    }

    seen.add(record.url);
    products.push(record);
  }

  const productsResult = {
    createdAt: new Date().toISOString(),
    totalProducts: products.length,
    priceConversion: conversion,
    products
  };

  const collectionsResult = {
    createdAt: new Date().toISOString(),
    totalCollections: collections.length,
    collections
  };

  await writeJson(ARTIFACTS.products, productsResult);
  await writeJson(ARTIFACTS.collections, collectionsResult);
  await fs.promises.writeFile(
    ARTIFACTS.productsCsv,
    toCsv(products.flatMap(productRowsForCsv)),
    "utf8"
  );
  await fs.promises.writeFile(
    ARTIFACTS.productsAdminCsv,
    toCsv(products.flatMap(productRowsForAdminImport)),
    "utf8"
  );
  await fs.promises.writeFile(
    ARTIFACTS.collectionsCsv,
    toCsv(collections.flatMap(collectionRowsForCsv)),
    "utf8"
  );

  logStep(
    "products",
    `Extracted ${products.length} products and ${collections.length} collections`
  );

  return {
    ...productsResult,
    collections: collectionsResult.collections,
    totalCollections: collectionsResult.totalCollections
  };
}

export async function run() {
  return extractProducts();
}

if (process.argv[1]?.endsWith("extract-products.js")) {
  run().catch(error => {
    console.error(`[products] Extraction failed: ${error.message}`);
    process.exit(1);
  });
}
