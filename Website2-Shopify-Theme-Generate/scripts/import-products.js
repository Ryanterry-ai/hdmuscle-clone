// Product Import Script for Morphogen Nutrition
// Run with Node.js: node import-products.js

// Configuration
const SHOPIFY_DOMAIN = '0h5kgk-cq.myshopify.com';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // Get from Shopify Admin → Settings → Apps → Develop apps

// Sample product data - Replace with actual data from original store
const products = [
  {
    title: "Product Name",
    body_html: "<p>Product description</p>",
    vendor: "Morphogen Nutrition",
    product_type: "Supplements",
    variants: [
      {
        price: "29.99",
        sku: "SKU001",
        inventory_policy: "deny",
        inventory_quantity: 100
      }
    ],
    images: [
      {
        src: "https://example.com/image.jpg"
      }
    ]
  }
];

async function createProduct(product) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ACCESS_TOKEN
    },
    body: JSON.stringify({ product })
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log(`✓ Created: ${product.title}`);
    return data.product;
  } else {
    const error = await response.text();
    console.log(`✗ Failed: ${product.title} - ${error}`);
    return null;
  }
}

async function importAllProducts() {
  console.log('Starting product import...\n');
  
  for (const product of products) {
    await createProduct(product);
    await new Promise(r => setTimeout(r, 1000)); // Rate limiting
  }
  
  console.log('\nImport complete!');
}

// Run if executed directly
// importAllProducts();

module.exports = { createProduct, importAllProducts };