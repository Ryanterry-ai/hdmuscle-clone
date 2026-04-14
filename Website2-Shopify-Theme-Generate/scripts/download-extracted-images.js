const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const urls = [
  "https://cdn.shopify.com/s/files/1/0634/6486/6026/files/9296OPLOGO-order-protect_689d41f4-1cf3-4be7-8f7d-cb5621daed06.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_ALPHAGEN_STRAWLEMON_TILT.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/ALPHAGEN_Strawberry_Lemonade_web_label.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/ALPHAGEN_Peach_Rings_web_label.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/ALPHAGEN_Blue_Shark_Gummy_web_label.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MORPHOGEN_BIOME_TILT_eb2c35fc-1350-4b4d-b1fe-19c5de581a90.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/BIOME_web_label.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_BOLIC_T_89dfdd87-254a-4772-bed1-f0a601cbdb23.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/Screen_Shot_2026-04-06_at_12.36.13_PM.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_BRAIN_TILT_c8586e7e-9dea-4371-8ac8-a12ed0c83401.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/Screen_Shot_2025-09-17_at_1.53.11_PM.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_BURN_TILT_1618d876-2dd5-4ed7-af61-d665dbd4b927.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/Screen_Shot_2025-09-26_at_5.46.09_PM.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_CALM_tilt.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/CALM_web_label.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_HEXAGEN_TILLT.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/Screen_Shot_2025-09-17_at_1.52.21_PM.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_COLLAGEN_TILT.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/COLLAGEN_web_label.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_CC_TILT.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/CORTISOL_CONTROL_web_label.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_CREATINE_TILT.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/Screen_Shot_2025-09-17_at_1.50.31_PM.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/morphogen-D3K2-all3_copy.jpg",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/morphogen-D3K2-render-right_copy.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_ENZYMES_TILT.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/ENZYMES_web_label.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/MN_GLUTAMINE_TILT.png",
  "https://cdn.shopify.com/s/files/1/0219/4666/files/Screen_Shot_2025-08-29_at_5.21.27_PM.png"
];

const downloadDir = './product-images';

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed: ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(filepath, () => {}); reject(err); });
  });
}

(async () => {
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
  
  let success = 0, failed = 0;
  
  for (const url of urls) {
    const filename = url.split('/').pop().split('?')[0];
    const filepath = path.join(downloadDir, filename);
    try {
      await download(url, filepath);
      console.log(`✓ ${filename}`);
      success++;
    } catch (e) {
      console.log(`✗ ${filename}: ${e.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
})();