# AI Website -> Shopify Theme Generator Skill

## Skill Name

AI Website to Shopify Theme Generator

## Skill Type

Multi-Agent | Model-Agnostic | Automation-First | Backward-Compatible

## Backward Compatibility

This skill extends the existing AI website cloning workflow instead of replacing it.

Existing responsibilities remain valid:

- website discovery
- browser crawl
- asset extraction
- Shopify theme generation
- validation
- ZIP packaging

New capabilities are layered onto the existing pipeline so older workflows still map to the same stages and script names.

## Plan Limits

Standard plan support:

- up to 600 crawlable HTML pages per website

If mapping discovers more than 600 pages:

- stop the Standard pipeline after site mapping
- write the partial `output/site-map.json`
- return a clear upgrade message instructing the operator to move to PRO

Required upgrade message:

- `This website exceeds the Standard plan limit of 600 pages. Upgrade to PRO to crawl more than 600 pages.`

## Primary Objective

Convert any website URL into a Shopify-compatible theme package that includes:

- discovered crawlable pages
- downloaded local assets
- extracted products and collections
- reusable Shopify sections and templates
- editable theme settings
- validation output
- upload-ready `theme.zip`
- host-anywhere static export in `output/public/` and root `public/`

## Universal Execution Workflow

1. Platform Detection
2. Website Cloning
3. URL Discovery and Page Mapping
4. Human Browser Crawl
5. Asset Extraction
6. Asset Download and Rewriting
7. UI Component Detection
8. Product and Collection Extraction
9. HTML to Shopify Liquid Conversion
10. Shopify Theme Generation
11. Shopify Settings Schema Generation
12. Theme Validation
13. Theme Packaging
14. Static Export Validation
15. Static Export Packaging

## Execution Order And Dependency Map

- `scripts/crawl-site.js`
  Input: target URL
  Output: `output/site-map.json`, `output/crawl-results.json`, `output/site-profile.json`
- `scripts/extract-assets.js`
  Input: `output/crawl-results.json`
  Output: `output/assets/asset-manifest.json`
- `scripts/download-images.js`
  Input: `output/assets/asset-manifest.json`
  Output: downloaded files under `output/assets/**`, updated manifest
- `scripts/extract-products.js`
  Input: `output/crawl-results.json`
  Output: `output/products.json`
- `scripts/classify-pages.js`
  Input: `output/crawl-results.json`
  Output: `output/page-classification.json`
- `scripts/generate-shopify-theme.js`
  Input: map, crawl, assets, classification, products
  Output: `output/theme/**`, `output/theme/theme-data.json`
- `scripts/validate-theme.js`
  Input: `output/theme/**`, `output/theme/theme-data.json`
  Output: validation pass/fail
- `scripts/build-theme-zip.js`
  Input: `output/theme/**`
  Output: `output/theme.zip`
- `scripts/export-static-site.js`
  Input: `output/crawl-results.json`, `output/assets/asset-manifest.json`
  Output: `output/public/**`, `public/**`, `output/public/export-manifest.json`
- `scripts/validate-static-export.js`
  Input: `output/public/**`, `output/public/export-manifest.json`
  Output: validation pass/fail for hosting bundle integrity
- `scripts/build-static-zip.js`
  Input: `output/public/**`
  Output: `output/public.zip`

Catalog outputs generated during extraction:

- `output/products.json`
- `output/collections.json`
- `output/catalog/products.csv`
- `output/catalog/collections.csv`

Static hosting outputs:

- `output/public/**`
- `public/**`
- `output/public/export-manifest.json`
- `output/public.zip`

If a required upstream artifact is missing, the stage must fail with a clear error instead of silently skipping work.

## Skill Modules

### 1. Website Cloning Skill

Responsibilities:

- accept any website URL
- normalize the starting URL
- collect crawlable same-site HTML pages
- preserve homepage, product, collection, policy, article, and content pages
- exclude static assets, checkout flows, account flows, feeds, and API endpoints from HTML crawl queues

Local command:

- `node scripts/crawl-site.js https://example.com`

Expected outputs:

- `output/site-map.json`
- `output/crawl-results.json`
- `output/products.json`
- `output/collections.json`
- `output/catalog/products.csv`
- `output/catalog/collections.csv`

Fallback handling:

- if `sitemap.xml` is unavailable, continue using browser-discovered links
- if a page fails to load, log the URL and continue crawling other pages
- if JavaScript hydration never settles, capture the best available DOM after timeout

### 2. Platform Detection Skill

Responsibilities:

- detect Shopify, WordPress, WooCommerce, React, Next.js, Vue, static HTML, or other recognizable stacks
- detect likely client-rendered vs server-rendered sites
- identify animation libraries and major component systems

Local command:

- built into `scripts/crawl-site.js`

Expected outputs:

- `output/site-profile.json`

Fallback handling:

- if platform is unknown, mark as `Static HTML` and continue with generic extraction rules
- if multiple frameworks are present, prefer the framework that controls the final DOM

### 3. Asset Extraction Skill

Responsibilities:

- aggregate images, CSS, JS, fonts, SVGs, icons, videos, and media references from crawled pages
- normalize and deduplicate asset URLs
- preserve file extensions where possible
- emit a real manifest that downstream steps can consume

Local command:

- `node scripts/extract-assets.js`

Expected outputs:

- `output/assets/asset-manifest.json`

Fallback handling:

- if inline CSS references nested assets, those assets must be added during download expansion
- if an asset URL cannot be normalized, log and skip it instead of crashing the stage

### 4. UI Component Detection Skill

Responsibilities:

- detect header, footer, hero, announcement bars, product grids, collection grids, mega menus, forms, and repeated content sections
- capture structural summaries from crawled DOM
- emit enough information for section generation and fallback rendering

Local command:

- built into `crawler/human-crawler.js`

Expected outputs:

- component hints inside `output/crawl-results.json`

Fallback handling:

- if selectors are framework-specific, fall back to semantic tags and heading/content density
- if reusable boundaries are unclear, group by top-level sections from `main`

### 5. HTML To Shopify Liquid Conversion Skill

Responsibilities:

- convert captured page structure into Shopify-safe Liquid templates and sections
- favor Shopify objects for products and collections when available
- fall back to captured static content when Shopify data does not yet exist
- flatten unsupported JavaScript behavior into HTML, CSS, and editable settings where possible

Local command:

- `node scripts/generate-shopify-theme.js`

Expected outputs:

- `output/theme/layout/theme.liquid`
- `output/theme/templates/*.liquid`
- `output/theme/sections/*.liquid`

Fallback handling:

- if interactive JS widgets cannot be ported safely, render a static visual approximation
- if source markup is too dynamic to preserve, keep the visual structure and content hierarchy

### 6. Shopify Theme Generator Skill

Responsibilities:

- generate a valid Shopify folder structure
- copy downloaded local assets into theme assets
- create a theme shell that references local CSS and downloaded media
- create homepage, product, and collection templates

Local command:

- `node scripts/generate-shopify-theme.js`

Expected outputs:

- `output/theme/layout/theme.liquid`
- `output/theme/templates/index.liquid`
- `output/theme/templates/product.liquid`
- `output/theme/templates/collection.liquid`
- `output/theme/sections/header.liquid`
- `output/theme/sections/footer.liquid`
- `output/theme/assets/theme.css`
- `output/theme/config/settings_schema.json`

Fallback handling:

- if no logo is detected, fall back to site name text
- if no collection data is available, render fallback cards from crawled pages
- if no product collection is mapped yet, render extracted product fallbacks instead of empty markup

### 7. Shopify Settings Schema Generator Skill

Responsibilities:

- expose editable settings for major cloned visuals
- keep sections editable in Shopify admin
- add safe defaults for headings, colors, and key images

Local command:

- built into `scripts/generate-shopify-theme.js`

Expected outputs:

- `output/theme/config/settings_schema.json`
- section schema blocks embedded in generated section files

Fallback handling:

- if a source property cannot be made dynamic safely, keep it as static fallback content
- never generate invalid or empty schema purely to satisfy a file check

### 8. Theme Build And Packaging Skill

Responsibilities:

- validate required theme files and directories
- verify referenced asset files exist inside the generated theme
- ZIP the final theme from `output/theme`

Local commands:

- `node scripts/validate-theme.js`
- `node scripts/build-theme-zip.js`

Expected outputs:

- validation success or failure
- `output/theme.zip`

Fallback handling:

- if required files are missing, stop the pipeline with a clear error
- if the theme directory is empty, do not create a fake ZIP

### 9. Static Hosting Export Skill

Responsibilities:

- export each crawled page as an individual HTML file
- rewrite same-site links to local exported routes
- rewrite asset references to downloaded local files
- mirror the deployable bundle to a root-level `public/` directory

Local command:

- `node scripts/export-static-site.js`

Expected outputs:

- `output/public/index.html`
- `output/public/**/index.html`
- `output/public/assets/**`
- `public/**`
- `output/public/export-manifest.json`
- `output/public.zip`

Fallback handling:

- if an asset was not downloaded locally, preserve the original URL rather than breaking the export
- if a page route cannot be mapped, keep the original link target

### 10. Static Export Validation And Packaging Skill

Responsibilities:

- verify the static hosting bundle contains the required root entry files
- verify exported HTML resolves to local assets and local page routes where expected
- package the deployable static bundle for cPanel or generic hosting uploads

Local commands:

- `node scripts/validate-static-export.js`
- `node scripts/build-static-zip.js`

Expected outputs:

- validation success or failure
- `output/public.zip`

Fallback handling:

- if a missing local page reference is detected, fail loudly so the export can be repaired before deployment
- if a remote asset must remain remote, keep it explicit in the export instead of writing a broken local path

## Pixel-Perfect Cloning Rules

Always:

- crawl real browser-rendered pages
- download real assets where possible
- preserve major layout structure, headings, imagery, and visual rhythm
- use local theme assets instead of remote asset URLs when assets were downloaded successfully
- keep outputs under `output/`

Never:

- claim success when a stage did not run
- treat CDN image or font URLs as crawlable HTML pages
- silently drop validation or packaging steps
- generate empty placeholder theme files when meaningful content can be produced

## Commands To Run Locally

Full pipeline:

- `node scripts/crawl-site.js https://hdmuscle.com`

Stage-by-stage:

- `node scripts/extract-assets.js`
- `node scripts/download-images.js`
- `node scripts/extract-products.js`
- `node scripts/classify-pages.js`
- `node scripts/generate-shopify-theme.js`
- `node scripts/validate-theme.js`
- `node scripts/build-theme-zip.js`
- `node scripts/export-static-site.js`
- `node scripts/validate-static-export.js`
- `node scripts/build-static-zip.js`

NPM aliases:

- `npm run crawl -- https://hdmuscle.com`
- `npm run extract`
- `npm run download`
- `npm run products`
- `npm run classify`
- `npm run theme`
- `npm run validate`
- `npm run zip`
- `npm run static`
- `npm run static:validate`
- `npm run static:zip`

## Live Clone Handoff Steps

After a successful pipeline run:

1. Review `output/theme/` and confirm the cloned sections, assets, and templates are present.
2. Review `output/public/` or root `public/` and confirm the static hosting bundle contains page-by-page HTML files and local assets.
3. Review `output/catalog/products.csv` and verify product titles, prices, variants, and images.
4. Review `output/catalog/collections.csv` and confirm collection handles and mapped product URLs.
5. In Shopify admin, create or connect the target store.
6. Upload `output/theme.zip` as the theme.
7. Import `output/catalog/products.csv` into Shopify products.
8. Recreate or bulk-create collections using `output/collections.json` and `output/catalog/collections.csv` as the local source-of-truth.
9. Recheck menus, collection assignments, and homepage featured content inside the theme customizer.
10. Replace unsupported app widgets or custom scripts with Shopify-native or app-store-compatible equivalents.
11. Publish the theme only after QA on desktop, tablet, mobile, product pages, collection pages, and cart flow.
12. For cPanel or generic hosting, upload `output/public.zip` or the root `public/` directory to the document root such as `public_html/`.
13. Confirm the hosting platform serves `index.html` for nested folders and respects the generated `.htaccess` fallback rules.
14. QA the hosted static export after upload so broken relative paths are caught before handoff.

## Required Manual Review Steps

Automation reduces manual work, but these checks still matter:

- verify that the homepage hero and top navigation visually match the source
- review fonts and brand imagery if the site uses third-party hosted fonts or restrictive media URLs
- verify product handles, descriptions, and media if source data came from heavily client-rendered widgets
- remove or replace unsupported source JavaScript that is not Shopify-safe
- review external app widgets, loyalty popups, review embeds, or account/checkout widgets

## Known Limitations And Fallback Strategy

- Checkout, cart, account, and customer flows are not cloned as source behavior; Shopify-native flows must replace them.
- Heavily client-rendered React or app-like sites may only be partially reconstructable from the final DOM.
- Third-party widgets may degrade to static content or be omitted if they are not Shopify-compatible.
- Complex animation libraries may be approximated with CSS and simplified section markup.
- Pixel-perfect parity is best-effort until manual QA confirms typography, spacing, and edge-case responsive behavior.

## Validation Gates

The workflow is considered complete only if:

- `output/site-map.json` exists with real page objects
- `output/crawl-results.json` exists with crawled page data
- `output/assets/asset-manifest.json` exists and downloaded assets are recorded
- `output/catalog/products.csv` exists
- `output/catalog/collections.csv` exists
- `output/theme/layout/theme.liquid` exists and is non-empty
- required templates and sections exist and are non-empty
- `output/theme/theme-data.json` exists
- `output/theme.zip` exists after packaging
- `output/public/index.html` exists and is non-empty
- `output/public/export-manifest.json` exists
- `output/public.zip` exists after packaging
