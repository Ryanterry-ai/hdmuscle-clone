# Deployment And Test Guide

## What This Project Produces

The pipeline now produces two deployable outputs from the same crawl:

- Shopify theme package: `output/theme.zip`
- Static hosting package: `output/public.zip`

It also mirrors the static hosting bundle to:

- `public/`

Use the Shopify package when uploading into Shopify admin.
Use the static package or `public/` folder when uploading to cPanel, Apache hosting, or any host that serves plain HTML assets.

## Standard Plan Limit

- Standard support allows up to 600 crawlable HTML pages.
- If the mapper finds more than 600 pages, the crawl stops after `output/site-map.json`.
- Upgrade to PRO to continue sites larger than 600 pages.

## Step 1: Install Browser Dependencies

Run:

```powershell
npx playwright install
```

## Step 2: Run The Full Clone Pipeline

Run:

```powershell
node scripts/crawl-site.js https://hdmuscle.com
```

This performs:

- site mapping
- browser crawl
- asset extraction
- asset download
- product extraction
- collection extraction
- page classification
- Shopify theme generation
- Shopify theme validation
- Shopify theme ZIP packaging
- static export generation
- static export validation
- static ZIP packaging

## Step 3: Resume Stage By Stage If Needed

If the crawl already produced saved artifacts, run the stages individually:

```powershell
node scripts/extract-assets.js
node scripts/download-images.js
node scripts/extract-products.js
node scripts/classify-pages.js
node scripts/generate-shopify-theme.js
node scripts/validate-theme.js
node scripts/build-theme-zip.js
node scripts/export-static-site.js
node scripts/validate-static-export.js
node scripts/build-static-zip.js
```

## Step 4: Confirm Required Outputs

Check these outputs:

- `output/site-map.json`
- `output/crawl-results.json`
- `output/assets/asset-manifest.json`
- `output/products.json`
- `output/collections.json`
- `output/catalog/products.csv`
- `output/catalog/collections.csv`
- `output/theme/theme-data.json`
- `output/theme.zip`
- `output/public/export-manifest.json`
- `output/public.zip`
- `public/`

## Step 5: Test The Static Demo Locally

Option A: Python static server

```powershell
python -m http.server 8080 -d public
```

Then open:

- `http://localhost:8080/`

Option B: Any static host preview

- point your local static server or hosting preview at the root `public/` folder

What to test:

- homepage
- header and footer
- collection pages
- product pages
- internal navigation
- images, CSS, JS, and fonts
- mobile layout
- policy or content pages

## Step 6: Upload To Shopify

1. Open Shopify admin.
2. Go to `Online Store -> Themes`.
3. Upload `output/theme.zip`.
4. Wait for Shopify to finish processing the theme.
5. Open theme preview.
6. Check homepage, collections, products, footer, header, and images.
7. Import `output/catalog/products.csv` into Shopify products.
8. Rebuild collections using `output/collections.json` and `output/catalog/collections.csv`.
9. Reconnect navigation, featured products, and homepage sections inside the theme editor.
10. Publish only after QA passes on desktop and mobile.

## Step 7: Upload To cPanel Or Public Hosting

1. Upload `output/public.zip` or the root `public/` folder.
2. If using cPanel, extract the files into `public_html/` or your selected document root.
3. Keep the generated `.htaccess` file in place for route handling on Apache-style hosting.
4. Verify `index.html` is served for route folders.
5. Open the live URL and test the key pages.

## Step 8: Live QA Checklist

Verify the live clone matches the source as closely as possible:

- logo placement
- header menu order
- hero section
- product cards
- product detail layout
- collection layout
- imagery and icons
- typography scale
- spacing rhythm
- footer links

## Important Reality Check

This pipeline is now much more reliable and deployable, but final pixel-perfect parity still needs QA for:

- third-party widgets
- app embeds
- checkout and account flows
- source-specific JavaScript behavior
- deeply client-rendered UI states

Treat the generated theme and static export as production-ready starting points with validation, not as a guarantee that every source website will upload or host with zero manual review.
