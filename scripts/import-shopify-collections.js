import {
  ARTIFACTS,
  logStep,
  readCliArg,
  readJson,
  toHandle,
  writeJson
} from "./pipeline-utils.js";

const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-01";
const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN || process.env.SHOPIFY_SHOP || "";
const SHOPIFY_ADMIN_TOKEN =
  process.env.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN || "";

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

function chunk(values, size) {
  const chunks = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

function normalizeMode(value) {
  return value === "apply" ? "apply" : "dry-run";
}

function looksLikePlaceholder(value) {
  const normalized = String(value || "").trim().toLowerCase();

  return (
    !normalized ||
    normalized.includes("your_admin_api_token") ||
    normalized.includes("your-access-token") ||
    normalized.includes("replace_me") ||
    normalized.includes("paste-token") ||
    normalized === "changeme"
  );
}

function ensureCredentials() {
  if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    throw new Error(
      "Missing Shopify credentials. Set SHOPIFY_SHOP_DOMAIN and SHOPIFY_ADMIN_TOKEN."
    );
  }

  if (looksLikePlaceholder(SHOPIFY_ADMIN_TOKEN)) {
    throw new Error(
      "SHOPIFY_ADMIN_TOKEN is still a placeholder. Replace YOUR_ADMIN_API_TOKEN with a real Shopify Admin API access token from your custom app."
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

function productHandleFromUrl(url) {
  if (!url) {
    return "";
  }

  try {
    const pathname = new URL(url).pathname;
    return toHandle(decodeURIComponent(pathname.split("/").filter(Boolean).pop() || ""));
  } catch {
    return "";
  }
}

function normalizeCollection(collection) {
  const descriptionHtml = cleanCollectionText(collection.description || "");

  return {
    handle: collection.handle,
    title: cleanCollectionText(collection.title || collection.handle || ""),
    descriptionHtml: isCollectionFilterBoilerplate(descriptionHtml) ? "" : descriptionHtml,
    productHandles: [...new Set((collection.productUrls || []).map(productHandleFromUrl).filter(Boolean))]
  };
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
        }
      }
    }`,
    {
      query: `handle:${handle}`
    }
  );

  const productId = data.products.nodes[0]?.id || null;
  cache.set(handle, productId);
  return productId;
}

async function getCollectionByHandle(handle, cache) {
  if (cache.has(handle)) {
    return cache.get(handle);
  }

  const data = await shopifyGraphQL(
    `query CollectionByHandle($query: String!) {
      collections(first: 1, query: $query) {
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

  const collection = data.collections.nodes[0] || null;
  cache.set(handle, collection);
  return collection;
}

async function createCollection(input) {
  const data = await shopifyGraphQL(
    `mutation CollectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          handle
          title
        }
        userErrors {
          field
          message
        }
      }
    }`,
    { input }
  );

  return data.collectionCreate;
}

async function updateCollection(input) {
  const data = await shopifyGraphQL(
    `mutation CollectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection {
          id
          handle
          title
        }
        userErrors {
          field
          message
        }
      }
    }`,
    { input }
  );

  return data.collectionUpdate;
}

async function addProductsToCollection(collectionId, productIds) {
  const results = [];

  for (const batch of chunk(productIds, 250)) {
    const data = await shopifyGraphQL(
      `mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          collection {
            id
            handle
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        id: collectionId,
        productIds: batch
      }
    );

    results.push({
      count: batch.length,
      userErrors: data.collectionAddProducts.userErrors || []
    });
  }

  return results;
}

export async function importShopifyCollections() {
  const mode = normalizeMode(readCliArg("mode", process.env.SHOPIFY_COLLECTION_MODE || "dry-run"));
  const payload = await readJson(ARTIFACTS.collections, "collections");
  const collections = (payload.collections || []).map(normalizeCollection);
  const result = {
    createdAt: new Date().toISOString(),
    mode,
    shop: SHOPIFY_SHOP_DOMAIN || "",
    apiVersion: SHOPIFY_API_VERSION,
    collections: []
  };

  if (mode === "apply") {
    ensureCredentials();
  }

  const productIdCache = new Map();
  const collectionCache = new Map();

  for (const collection of collections) {
    const record = {
      handle: collection.handle,
      title: collection.title,
      descriptionHtml: collection.descriptionHtml,
      intendedProductHandles: collection.productHandles,
      matchedProductIds: [],
      missingProductHandles: [],
      action: mode === "apply" ? "pending" : "dry-run"
    };

    if (mode === "dry-run") {
      result.collections.push(record);
      continue;
    }

    const existingCollection = await getCollectionByHandle(collection.handle, collectionCache);
    const collectionInput = {
      title: collection.title,
      handle: collection.handle,
      descriptionHtml: collection.descriptionHtml
    };

    let collectionMutationResult;

    if (existingCollection?.id) {
      record.action = "update";
      collectionMutationResult = await updateCollection({
        id: existingCollection.id,
        ...collectionInput
      });
    } else {
      record.action = "create";
      collectionMutationResult = await createCollection(collectionInput);
    }

    record.collection = collectionMutationResult.collection || null;
    record.userErrors = collectionMutationResult.userErrors || [];

    const collectionId = collectionMutationResult.collection?.id || existingCollection?.id || null;

    if (!collectionId) {
      result.collections.push(record);
      continue;
    }

    const productIds = [];

    for (const handle of collection.productHandles) {
      const productId = await getProductIdByHandle(handle, productIdCache);

      if (!productId) {
        record.missingProductHandles.push(handle);
        continue;
      }

      productIds.push(productId);
    }

    record.matchedProductIds = productIds;

    if (productIds.length) {
      record.productAssignments = await addProductsToCollection(collectionId, productIds);
    } else {
      record.productAssignments = [];
    }

    result.collections.push(record);
    logStep(
      "collections",
      `${record.action} ${collection.handle} with ${productIds.length} matched products`
    );
  }

  await writeJson(ARTIFACTS.shopifyCollectionResults, result);
  logStep("collections", `Wrote collection import results to ${ARTIFACTS.shopifyCollectionResults}`);
  return result;
}

if (process.argv[1]?.endsWith("import-shopify-collections.js")) {
  importShopifyCollections().catch(error => {
    console.error(`[collections] Failed: ${error.message}`);
    process.exitCode = 1;
  });
}
