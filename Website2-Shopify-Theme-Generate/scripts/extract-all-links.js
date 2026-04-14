// Extract ALL links from website - 3 different methods
const fs = require('fs');
const https = require('https');
const http = require('http');

const outputDir = 'C:/Users/viren/Downloads/ai-website-cloner-template-master/ai-website-cloner-template-master/Website2-Shopify-Theme-Generate';
const linksFile = `${outputDir}/all-links.json`;

// Method 1: Simple HTTP fetch and parse
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function extractAllLinks() {
  console.log('🔍 Extracting ALL links from Morphogen Nutrition...\n');
  
  const baseUrl = 'https://www.morphogennutrition.com';
  const allLinks = {
    products: [],
    images: [],
    pages: [],
    collections: [],
    other: []
  };
  
  try {
    // 1. Fetch homepage
    console.log('Fetching homepage...');
    let html = await fetchHTML(baseUrl);
    console.log(`✓ Homepage: ${html.length} bytes`);
    
    // Extract all hrefs
    const hrefPattern = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefPattern.exec(html)) !== null) {
      const link = match[1];
      
      if (link.includes('/products/') && !link.includes('#')) {
        const handle = link.split('/products/')[1]?.split('?')[0];
        if (handle && !allLinks.products.includes(handle)) {
          allLinks.products.push(handle);
        }
      }
      else if (link.includes('/collections/')) {
        const col = link.split('/collections/')[1]?.split('?')[0];
        if (col && col !== '' && !allLinks.collections.includes(col)) {
          allLinks.collections.push(col);
        }
      }
      else if (link.includes('/pages/')) {
        const page = link.split('/pages/')[1]?.split('?')[0];
        if (page && !allLinks.pages.includes(page)) {
          allLinks.pages.push(page);
        }
      }
    }
    
    // Extract images - look for various patterns
    const imagePatterns = [
      /src=["']([^"']*cdn[^"']*)["']/gi,
      /data-src=["']([^"']*)["']/gi,
      /data-lazy-src=["']([^"']*)["']/gi,
      /<img[^>]+srcset=["']([^"']*)["']/gi,
    ];
    
    imagePatterns.forEach(pattern => {
      let imgMatch;
      while ((imgMatch = pattern.exec(html)) !== null) {
        const src = imgMatch[1].split(' ')[0]; // Get first URL from srcset
        if (src && src.includes('morphogennutrition.com') && src.includes('/files/')) {
          const cleanUrl = src.split('?')[0];
          if (!allLinks.images.includes(cleanUrl)) {
            allLinks.images.push(cleanUrl);
          }
        }
      }
    });
    
    console.log(`✓ Found ${allLinks.products.length} products`);
    console.log(`✓ Found ${allLinks.collections.length} collections`);
    console.log(`✓ Found ${allLinks.images.length} images`);
    
    // 2. Fetch a few product pages to get more images
    console.log('\nFetching individual product pages for more images...');
    
    const sampleProducts = allLinks.products.slice(0, 20);
    
    for (const product of sampleProducts) {
      try {
        const productUrl = `${baseUrl}/products/${product}`;
        const productHtml = await fetchHTML(productUrl);
        
        // Get images from this product
        const productImgPattern = /(?:src|data-src|data-image)=["']([^"']+)["']/gi;
        let imgMatch;
        while ((imgMatch = productImgPattern.exec(productHtml)) !== null) {
          const src = imgMatch[1];
          if (src && (src.includes('/files/') || src.includes('cdn.shopify'))) {
            const cleanUrl = src.split('?')[0];
            if (!allLinks.images.includes(cleanUrl)) {
              allLinks.images.push(cleanUrl);
            }
          }
        }
        
        console.log(`✓ ${product}: found ${(productHtml.match(/\/files\//g) || []).length} images`);
        
      } catch (e) {
        console.log(`✗ Error fetching ${product}: ${e.message}`);
      }
    }
    
    // 3. Fetch collections page
    console.log('\nFetching collections...');
    const collectionsHtml = await fetchHTML(`${baseUrl}/collections`);
    
    const collectionPattern = /\/collections\/([^"'&?]+)/g;
    let colMatch;
    while ((colMatch = collectionPattern.exec(collectionsHtml)) !== null) {
      const col = colMatch[1];
      if (col && !col.includes('{{') && !allLinks.collections.includes(col)) {
        allLinks.collections.push(col);
      }
    }
    
    // Save results
    fs.writeFileSync(linksFile, JSON.stringify(allLinks, null, 2));
    
    console.log('\n=== COMPLETE ===');
    console.log(`Products: ${allLinks.products.length}`);
    console.log(`Images: ${allLinks.images.length}`);
    console.log(`Collections: ${allLinks.collections.length}`);
    console.log(`Pages: ${allLinks.pages.length}`);
    console.log(`\nSaved to: ${linksFile}`);
    
    // Print image URLs
    console.log('\n📸 IMAGE URLs FOUND:');
    allLinks.images.forEach(img => console.log(`  ${img}`));
    
    return allLinks;
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

extractAllLinks().catch(console.error);