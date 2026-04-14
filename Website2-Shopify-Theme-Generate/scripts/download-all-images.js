// Step 2: Download all images from extracted URLs
// Run with: node download-all-images.js

const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const downloadDir = './product-images';
const urlsFile = './image-urls.json';

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const file = fs.createWriteStream(filepath);
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        file.close();
        fs.unlink(filepath, () => {});
        downloadImage(redirectUrl, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    });
    
    request.on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {});
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      fs.unlink(filepath, () => {});
      reject(new Error('Download timeout'));
    });
  });
}

async function downloadAllImages() {
  // Read URLs from file
  if (!fs.existsSync(urlsFile)) {
    console.error(`Error: ${urlsFile} not found!`);
    console.log('Please run extract-image-urls.js first');
    process.exit(1);
  }
  
  const urls = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
  
  // Create download directory
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
  
  console.log(`Found ${urls.length} image URLs to download`);
  console.log(`Download directory: ${downloadDir}\n`);
  
  let success = 0;
  let failed = 0;
  const failedUrls = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const filename = path.basename(url.split('?')[0]);
    const filepath = path.join(downloadDir, filename);
    
    // Skip if already downloaded
    if (fs.existsSync(filepath)) {
      console.log(`⏭  Skipped (exists): ${filename}`);
      success++;
      continue;
    }
    
    try {
      await downloadImage(url, filepath);
      console.log(`✓ [${i + 1}/${urls.length}] Downloaded: ${filename}`);
      success++;
    } catch (err) {
      console.log(`✗ [${i + 1}/${urls.length}] Failed: ${filename} - ${err.message}`);
      failed++;
      failedUrls.push(url);
    }
    
    // Rate limiting - wait between downloads
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('\n=== DOWNLOAD COMPLETE ===');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  
  if (failedUrls.length > 0) {
    fs.writeFileSync('./failed-downloads.json', JSON.stringify(failedUrls, null, 2));
    console.log(`\nFailed URLs saved to: failed-downloads.json`);
  }
  
  // List all downloaded files
  const downloadedFiles = fs.readdirSync(downloadDir);
  console.log(`\nTotal images downloaded: ${downloadedFiles.length}`);
  console.log(`Directory: ${downloadDir}`);
}

downloadAllImages();