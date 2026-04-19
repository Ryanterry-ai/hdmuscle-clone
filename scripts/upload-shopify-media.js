import {
  ARTIFACTS,
  logStep,
  readCliArg,
  readJson,
  writeJson
} from "./pipeline-utils.js";

const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-01";
const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_SHOP || "";
const SHOPIFY_ADMIN_TOKEN =
  process.env.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN || "";

function chunk(values, size) {
  const chunks = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

function normalizeMode(value) {
  return ["files", "product-media", "all"].includes(value) ? value : "all";
}

function ensureCredentials() {
  if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    throw new Error(
      "Missing Shopify credentials. Set SHOPIFY_SHOP_DOMAIN and SHOPIFY_ADMIN_TOKEN."
    );
  }
}

async function shopifyGraphQL(query, variables = {}) {
  const response = await fetch(
    `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN
      },
      body: JSON.stringify({ query, variables })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Shopify GraphQL request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(payload.errors.map(error => error.message).join("; "));
  }

  return payload.data;
}

function toFileContentType(entry) {
  const type = String(entry.type || entry.contentType || "").toLowerCase();

  if (type.includes("video") || /\.mp4|\.mov|\.webm|\.m4v$/i.test(entry.originalUrl || "")) {
    return "VIDEO";
  }

  if (type.includes("model")) {
    return "MODEL_3D";
  }

  return "IMAGE";
}

function toProductMediaType(entry) {
  return String(entry.mediaContentType || "").toUpperCase() === "VIDEO" ? "VIDEO" : "IMAGE";
}

async function uploadFiles(mediaManifest) {
  const entries = (mediaManifest.excludedAssets || []).filter(
    entry => entry.uploadTarget === "files"
  );
  const results = [];

  for (const batch of chunk(entries, 25)) {
    const imageEntries = batch.filter(entry => toFileContentType(entry) === "IMAGE");
    const skipped = batch
      .filter(entry => toFileContentType(entry) !== "IMAGE")
      .map(entry => ({
        ...entry,
        status: "skipped",
        reason: "Direct fileCreate URL uploads are only implemented for image files in this script."
      }));

    results.push(...skipped);

    if (!imageEntries.length) {
      continue;
    }

    const data = await shopifyGraphQL(
      `mutation FileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            alt
            fileStatus
          }
          userErrors {
            field
            message
            code
          }
        }
      }`,
      {
        files: imageEntries.map(entry => ({
          alt: entry.alt,
          contentType: "IMAGE",
          duplicateResolutionMode: "APPEND_UUID",
          filename: entry.suggestedShopifyFilename,
          originalSource: entry.originalUrl
        }))
      }
    );

    const payload = data.fileCreate;

    results.push(
      ...imageEntries.map((entry, index) => ({
        sourceUrl: entry.normalizedUrl,
        filename: entry.suggestedShopifyFilename,
        status: payload.files?.[index]?.fileStatus || "UNKNOWN",
        shopifyFileId: payload.files?.[index]?.id || "",
        alt: payload.files?.[index]?.alt || entry.alt,
        userErrors: payload.userErrors || []
      }))
    );
  }

  logStep("shopify-upload", `Processed ${results.length} Shopify Files entries`);
  return results;
}

async function getProductIdByHandle(handle, cache) {
  if (cache.has(handle)) {
    return cache.get(handle);
  }

  const data = await shopifyGraphQL(
    `query ProductByHandle($query: String!) {
      products(first: 1, query: $query) {
        nodes {
          id
          handle
          title
        }
      }
    }`,
    {
      query: `handle:${handle}`
    }
  );

  const product = data.products.nodes[0] || null;
  cache.set(handle, product?.id || null);
  return product?.id || null;
}

async function uploadProductMedia(productMediaPayload) {
  const entries = productMediaPayload.entries || [];
  const grouped = new Map();
  const productIdCache = new Map();
  const results = [];

  for (const entry of entries) {
    const group = grouped.get(entry.productHandle) || [];
    group.push(entry);
    grouped.set(entry.productHandle, group);
  }

  for (const [productHandle, items] of grouped.entries()) {
    const productId = await getProductIdByHandle(productHandle, productIdCache);

    if (!productId) {
      results.push(
        ...items.map(entry => ({
          ...entry,
          status: "skipped",
          reason: `Product handle not found in Shopify: ${productHandle}`
        }))
      );
      continue;
    }

    for (const batch of chunk(items, 10)) {
      const data = await shopifyGraphQL(
        `mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
          productCreateMedia(productId: $productId, media: $media) {
            media {
              alt
              mediaContentType
              status
            }
            mediaUserErrors {
              field
              message
              code
            }
          }
        }`,
        {
          productId,
          media: batch.map(entry => ({
            alt: entry.alt,
            mediaContentType: toProductMediaType(entry),
            originalSource: entry.originalSource
          }))
        }
      );

      const payload = data.productCreateMedia;

      results.push(
        ...batch.map((entry, index) => ({
          ...entry,
          productId,
          status: payload.media?.[index]?.status || "UNKNOWN",
          mediaContentType:
            payload.media?.[index]?.mediaContentType || toProductMediaType(entry),
          userErrors: payload.mediaUserErrors || []
        }))
      );
    }
  }

  logStep("shopify-upload", `Processed ${results.length} product media entries`);
  return results;
}

export async function uploadShopifyMedia() {
  ensureCredentials();

  const mode = normalizeMode(
    readCliArg("mode", process.env.SHOPIFY_UPLOAD_MODE || "all").toLowerCase()
  );
  const mediaManifest = await readJson(ARTIFACTS.mediaManifest, "media manifest");
  const productMediaPayload = await readJson(
    ARTIFACTS.productMediaUpload,
    "product media upload payload"
  );

  const result = {
    createdAt: new Date().toISOString(),
    shop: SHOPIFY_SHOP_DOMAIN,
    apiVersion: SHOPIFY_API_VERSION,
    mode,
    files: [],
    productMedia: []
  };

  if (mode === "files" || mode === "all") {
    result.files = await uploadFiles(mediaManifest);
  }

  if (mode === "product-media" || mode === "all") {
    result.productMedia = await uploadProductMedia(productMediaPayload);
  }

  await writeJson(ARTIFACTS.shopifyUploadResults, result);
  logStep("shopify-upload", `Wrote upload results to ${ARTIFACTS.shopifyUploadResults}`);

  return result;
}

if (process.argv[1]?.endsWith("upload-shopify-media.js")) {
  uploadShopifyMedia().catch(error => {
    console.error(`[shopify-upload] Failed: ${error.message}`);
    process.exit(1);
  });
}
