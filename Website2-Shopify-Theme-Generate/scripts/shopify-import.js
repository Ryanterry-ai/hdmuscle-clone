const fs = require('fs-extra');
const path = require('path');
const https = require('https');

const PRODUCTS_FILE = path.join(__dirname, '..', 'output', 'export', 'products.json');
const STORE = '0h5kgk-cq.myshopify.com';

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function importProducts() {
  const TOKEN = process.env.SHOPIFY_TOKEN;
  
  if (!TOKEN) {
    console.log('===============================================');
    console.log('MISSING SHOPIFY_TOKEN');
    console.log('===============================================');
    console.log('Set your Shopify Admin API token:');
    console.log('');
    console.log('1. Go to https://admin.shopify.com/settings/apps');
    console.log('2. Create an app > "Configure Admin API"');
    console.log('3. Select: write_products, write_products');
    console.log('4. Install > Copy access token (starts shpat_)');
    console.log('');
    console.log('Run:');
    console.log('$env:SHOPIFY_TOKEN = "shpat_xxxxx"');
    console.log('node scripts/shopify-import.js');
    console.log('===============================================');
    return;
  }

  console.log('[IMPORT] Store:', STORE);
  
  const products = await fs.readJson(PRODUCTS_FILE);
  console.log('[IMPORT] Products:', products.length);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i + 1}/${products.length}] ${p.handle}`);

    try {
      const payload = JSON.stringify({
        product: {
          title: p.title,
          body_html: p.body_html?.substring(0, 5000) || '',
          vendor: p.vendor || 'Morphogen Nutrition',
          product_type: p.product_type || '',
          tags: p.tags || '',
          handle: p.handle,
          variants: [{
            price: p.price || '29.99',
            compare_at_price: p.compare_at_price || '',
            sku: p.sku || p.handle.substring(0, 10).toUpperCase()
          }]
        }
      });

      const options = {
        hostname: STORE,
        path: '/admin/api/2024-01/products.json',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
          'X-Shopify-Access-Token': TOKEN
        }
      };

      const res = await httpRequest(options, payload);
      
      if (res.status === 201 || res.status === 200) {
        console.log(`    ✓ Created`);
        success++;
      } else {
        console.log(`    ✗ ${res.body.substring(0, 100)}`);
        failed++;
      }
    } catch (e) {
      console.log(`    ✗ ${e.message}`);
      failed++;
    }
  }

  console.log('\n===============================================');
  console.log('RESULT:', success, 'success,', failed, 'failed');
  console.log('===============================================');
}

importProducts();