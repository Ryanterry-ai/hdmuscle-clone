# AI Shopify Cloner

Pixel-perfect website cloning tool that converts any Shopify site into:
- **Static export** for hosting anywhere (Hostinger, Netlify, Vercel)
- **Shopify theme** for direct Shopify import

## Quick Start

```bash
# Install dependencies
npm install

# Run full pipeline on any Shopify site
node scripts/crawl-site.js https://example.com
```

## Features

- **Domain-independent exports** - Works on any hosting
- **Dynamic store configuration** - Change store URL without rebuild
- **Asset localization** - All images/CSS/JS downloaded locally
- **Runtime JavaScript** - Fallback for interactions (menus, modals, etc.)

## Commands

```bash
# Full pipeline (crawl → extract → export → validate)
node scripts/crawl-site.js <url>

# Individual steps
node scripts/extract-assets.js
node scripts/export-static-site.js
node scripts/validate-static-export.js
node scripts/build-static-zip.js
```

## Output

After running the pipeline, find your export in:
```
output/public/
```

## Dynamic Store Configuration

After deployment, edit `store-config.js` to point to your actual store:

```javascript
StoreConfig.storeUrl = 'https://your-actual-store.com';
```

No rebuild needed!
