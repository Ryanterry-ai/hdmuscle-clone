const https = require('https');

const STORE = '0h5kgk-cq.myshopify.com';
const TOKEN = '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';

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getProducts() {
  const options = {
    hostname: STORE,
    path: '/admin/api/2024-01/products.json?limit=10',
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json'
    }
  };
  const res = await httpRequest(options);
  console.log('Status:', res.status);
  console.log('Body:', res.body ? res.body.substring(0, 500) : 'No body');
  return res;
}

async function updateProductImage(productId, imageSrc) {
  const payload = JSON.stringify({
    image: {
      src: imageSrc
    }
  });

  const options = {
    hostname: STORE,
    path: `/admin/api/2024-01/products/${productId}/images.json`,
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  return httpRequest(options, payload);
}

async function main() {
  console.log('[1] Fetching products from Shopify...');
  const res = await getProducts();
  console.log('Raw response:', res.body ? res.body.substring(0, 500) : 'No body');
  const data = JSON.parse(res.body);
  const products = data.products || [];
  console.log(`    Found ${products.length} products`);

  const imageFiles = [];
  for (let i = 0; i < 60; i++) {
    const num = i.toString().padStart(4, '0');
    imageFiles.push(`product_${num}`);
  }

  console.log('[2] Updating products with new images...');
  let success = 0;
  let failed = 0;

  for (let i = 0; i < Math.min(products.length, imageFiles.length); i++) {
    const product = products[i];
    const imageNum = i.toString().padStart(4, '0');
    
    // Use Shopify Files URL pattern
    const imageSrc = `https://cdn.shopify.com/s/files/1/0634/6486/6026/files/product_${imageNum}.png`;

    console.log(`    [${i + 1}/${Math.min(products.length, imageFiles.length)}] ${product.title} -> product_${imageNum}.png`);

    try {
      const res = await updateProductImage(product.id, imageSrc);
      if (res.status === 201 || res.status === 200) {
        success++;
      } else {
        console.log(`        Error: ${res.body.substring(0, 100)}`);
        failed++;
      }
    } catch (e) {
      console.log(`        Error: ${e.message}`);
      failed++;
    }
  }

  console.log('\n===============================================');
  console.log('RESULT:', success, 'success,', failed, 'failed');
  console.log('===============================================');
}

main().catch(console.error);