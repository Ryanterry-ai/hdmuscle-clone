# Live Clone Checklist

## Standard Plan Limit

- Standard plan supports up to 600 crawlable HTML pages.
- If a site exceeds 600 pages, stop after `output/site-map.json` is created.
- Show this exact message:
  `This website exceeds the Standard plan limit of 600 pages. Upgrade to PRO to crawl more than 600 pages.`

## Required Local Outputs

After a successful Standard run, confirm these files exist:

- `output/site-map.json`
- `output/crawl-results.json`
- `output/site-profile.json`
- `output/assets/asset-manifest.json`
- `output/products.json`
- `output/collections.json`
- `output/catalog/products.csv`
- `output/catalog/collections.csv`
- `output/public/export-manifest.json`
- `output/public/**`
- `output/public.zip`
- `public/**`
- `output/theme/theme-data.json`
- `output/theme.zip`

## Local Build Commands

1. `npx playwright install`
2. `node scripts/crawl-site.js https://example.com`

If resuming from saved artifacts:

1. `node scripts/extract-assets.js`
2. `node scripts/download-images.js`
3. `node scripts/extract-products.js`
4. `node scripts/classify-pages.js`
5. `node scripts/generate-shopify-theme.js`
6. `node scripts/validate-theme.js`
7. `node scripts/build-theme-zip.js`
8. `node scripts/export-static-site.js`
9. `node scripts/validate-static-export.js`
10. `node scripts/build-static-zip.js`

## Shopify Go-Live Steps

1. Upload `output/theme.zip` to Shopify as the theme base.
2. Review the uploaded theme for missing sections, broken image references, and layout drift.
3. Import `output/catalog/products.csv` into Shopify products.
4. Rebuild collections using `output/collections.json` and `output/catalog/collections.csv`.
5. Reconnect menus and homepage featured sections inside the Shopify customizer.
6. Replace unsupported third-party widgets with Shopify-safe apps or custom sections.
7. QA homepage, collection pages, product pages, policy pages, cart, and mobile layout before publishing.

## Generic Hosting Steps

1. Upload `output/public.zip`, `output/public/`, or the mirrored root `public/` folder to the hosting provider.
2. For cPanel or Apache-style hosting, extract the files into the document root such as `public_html/`.
3. Ensure the host serves directory routes with `index.html`.
4. If Apache is used, keep the generated `.htaccess` file in place so route fallbacks and extensionless paths continue working.
5. Verify local assets are loading from `assets/` instead of the source domain.
6. QA homepage, collection pages, product pages, policy pages, and internal links after deployment.

## Product And Collection Notes

- `output/catalog/products.csv` is Shopify-friendly and intended as the import handoff file.
- `output/catalog/collections.csv` and `output/collections.json` are local source-of-truth files for collection reconstruction.
- Theme assets are downloaded locally into `output/assets/` and copied into `output/theme/assets/` where possible.
- Product image URLs in CSV may still reference source URLs for Shopify import compatibility; if fully local media import is required, upload product media separately through Shopify admin or API before final QA.

## Pixel-Perfect Reality Check

- The pipeline aims for the closest possible visual clone.
- Final live parity still requires QA for app widgets, popups, custom scripts, mega menus, and complex animation runtimes.
- Publish only after comparing the uploaded Shopify theme to the source site across desktop, tablet, and mobile.
- The generated outputs are structured for Shopify upload and generic hosting deployment, but a zero-issue guarantee across every third-party host, plugin, and source-site runtime is not realistic without final QA on the target environment.
