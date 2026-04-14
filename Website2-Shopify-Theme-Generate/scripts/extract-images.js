const { chromium } = require("playwright");
const fs = require("fs-extra");
const path = require("path");

const TARGET_URL = process.argv[2] || "https://hdmuscle.com/";
const OUTPUT_FILE = path.join(__dirname, "..", "output", "extracted", "images.json");

async function extractImages() {

console.log("[IMAGES] Starting image extraction...");
console.log(`[IMAGES] Target: ${TARGET_URL}`);

const baseUrl = new URL(TARGET_URL).origin;

const productsFile = path.join(
__dirname,
"..",
"output",
"extracted",
"products.json"
);

const products = await fs.readJson(productsFile);

const browser = await chromium.launch({ headless: true });

const context = await browser.newContext({
viewport: { width: 1920, height: 1080 }
});

const page = await context.newPage();

const allProductsImages = [];

const limitedProducts = products.slice(0, 30);

function isProductImage(url) {

if (!url) return false;

return (
url.includes("cdn.shopify.com") &&
(
url.includes("/products/") ||
url.includes("/files/")
) &&
(
url.includes(".jpg") ||
url.includes(".png") ||
url.includes(".webp")
)
);

}

for (let i = 0; i < limitedProducts.length; i++) {

const product = limitedProducts[i];

try {

const productUrl = `${baseUrl}/products/${product.handle}`;

await page.goto(productUrl, {
waitUntil: "networkidle",
timeout: 90000
});

await page.waitForTimeout(2000);

const images = await page.$$eval(
'img[src*="cdn.shopify.com"]',
imgs => imgs.map(img => img.src)
);

const cleanImages = [...new Set(
images
.filter(isProductImage)
.map(url => url.split("?")[0])
)];

console.log(
`[IMAGES] ${i + 1}/${limitedProducts.length}: ${product.handle} - ${cleanImages.length} images`
);

allProductsImages.push({
handle: product.handle,
images: cleanImages
});

} catch (e) {

console.log(`[IMAGES] Error ${product.handle}: ${e.message}`);

}

}

await browser.close();

await fs.ensureDir(path.dirname(OUTPUT_FILE));
await fs.writeJson(OUTPUT_FILE, allProductsImages, { spaces: 2 });

const total = allProductsImages.reduce(
(sum, p) => sum + p.images.length,
0
);

console.log(`[IMAGES] Complete! Total images: ${total}`);
console.log(`[IMAGES] Saved to ${OUTPUT_FILE}`);

return allProductsImages;

}

extractImages().catch(console.error);
