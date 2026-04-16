# AI Website -> Shopify Design Architecture

## Design Goal

Transform any crawlable website into a Shopify theme that is:

- visually close to the source
- section-based
- editable in Shopify admin
- responsive across desktop, tablet, and mobile
- packaged as a valid upload-ready theme

## Core Principles

- Reuse existing pipeline stages before adding new ones.
- Preserve real source structure and assets whenever possible.
- Favor Shopify-native objects and settings over hard-coded source behavior.
- Prefer degradable visual fidelity over broken JavaScript parity.
- Keep all generated outputs inside `output/`.

## Commercial Limit

Standard tier limit:

- support up to 600 crawlable HTML pages

Behavior when the site exceeds the Standard limit:

- stop after mapping
- preserve the discovered `output/site-map.json`
- require a PRO upgrade before continuing the full crawl and conversion pipeline

## Pixel-Perfect Cloning Rules

The generated theme should aim to preserve:

- page hierarchy
- header and footer structure
- hero layout
- product card rhythm
- collection layout
- typography scale
- color palette
- major spacing and section order
- primary calls to action
- source imagery and icons through local assets

Approximation rules:

- unsupported frameworks should be flattened into HTML, CSS, and Liquid
- app widgets may be reduced to static placeholders or omitted
- animation logic may be simplified if the original runtime cannot be reproduced safely

## Responsive Breakpoints

Every generated layout should be reviewed against these breakpoints:

- Desktop: `>= 1200px`
- Laptop: `992px - 1199px`
- Tablet: `768px - 991px`
- Mobile: `< 768px`

Responsive requirements:

- header navigation must collapse gracefully
- hero content must stack cleanly on mobile
- product and collection grids must reduce columns at smaller widths
- text should remain readable without horizontal overflow

## Shopify Theme Architecture

Required structure:

- `layout/theme.liquid`
- `templates/index.liquid`
- `templates/product.liquid`
- `templates/collection.liquid`
- `sections/header.liquid`
- `sections/footer.liquid`
- `assets/theme.css`
- `config/settings_schema.json`

Preferred supporting sections:

- `sections/hero.liquid`
- `sections/home-content.liquid`
- `sections/featured-products.liquid`
- `sections/featured-collections.liquid`
- `sections/product-template.liquid`
- `sections/collection-template.liquid`

Architecture rules:

- header and footer should be global sections
- homepage should compose reusable sections
- product and collection templates should prioritize Shopify objects
- scraped content should be used as fallback when Shopify data is unavailable

## URL Discovery And Page Modeling

Page discovery rules:

- only same-site HTML pages belong in the crawl queue
- CDN images, fonts, CSS, JS, PDFs, and videos are assets, not pages
- hashes and tracking parameters must be removed
- recommendation and duplicate product parameters should be stripped
- collection sorting and tracking noise should not create duplicate pages

Page categories to preserve:

- homepage
- product pages
- collection pages
- policy pages
- article or blog pages
- generic content or landing pages

## Product Template Design

Product page conversion must capture:

- title
- vendor or brand when available
- price and compare-at price when detectable
- featured imagery
- description content
- variant hints from forms or embedded JSON
- add-to-cart area using Shopify product forms

Template rules:

- always prefer Shopify `product` data in Liquid
- use scraped description or imagery as fallback copy
- keep the media and purchase summary visually prominent
- preserve the source page's content order when possible

## Collection Template Design

Collection conversion must capture:

- title
- intro text or lead content
- product card layout cues
- collection imagery where available

Template rules:

- use Shopify `collection.products` as the primary data source
- render fallback collection cards if no mapped Shopify collection exists yet
- preserve the card density and spacing rhythm from the source

## Header And Mega Menu Conversion

Header rules:

- preserve logo placement and brand hierarchy
- keep primary navigation links in the same order when possible
- convert same-site links to local theme paths instead of source-domain absolute URLs
- expose logo override through section settings

Mega menu rules:

- if a true mega menu cannot be reproduced safely, keep a simplified navigation layout
- preserve category groupings and major destinations even if dropdown behavior is simplified

## Footer Conversion

Footer rules:

- preserve major navigation groups, trust text, and contact or policy links
- keep footer visually distinct from the body
- avoid empty footer placeholders

## UI Component Conversion Rules

Convert these source patterns into reusable Shopify-friendly sections:

- hero banners
- rich text content bands
- product grids
- collection grids
- announcement bars
- promotional cards
- image and text split layouts

Component fallback rules:

- if repeated content structure is unclear, convert top-level sections from `main`
- if source markup is noisy, summarize it into cleaner Shopify-safe cards or text blocks
- if a section depends on unsupported JS, keep the static visual shell and content

## Asset Management Rules

Asset strategy:

- download assets into `output/assets/**`
- preserve useful file extensions
- deduplicate by normalized remote URL
- assign stable local filenames
- copy downloaded assets into `output/theme/assets/` for Shopify packaging
- rewrite CSS asset references to local Shopify asset URLs where possible

Asset types to support:

- images
- SVGs
- CSS
- JS
- fonts
- icons
- video and relevant media

Fallback rules:

- if a remote asset fails, log the failure and continue
- if an asset is referenced by generated Liquid, validation must confirm it exists locally

## Performance And Safety Rules

- do not include remote production asset URLs in generated theme markup when a local copy exists
- avoid blindly executing source-site JavaScript inside the Shopify theme
- simplify or omit nonessential third-party scripts
- keep generated CSS and markup readable enough for manual repair
- fail loudly on missing required theme artifacts

## Shopify Customizer Compatibility

Generated theme pieces should remain editable:

- logo
- hero text
- key colors
- featured collection choice
- product count limits where applicable

Customizer rules:

- use section schema for major editable fields
- prefer section settings over hard-coded text when easy to expose safely
- keep fallback source content embedded so the theme is not blank before merchant setup

## Validation Rules

The final generated theme must be checked for:

- required directories and files
- non-empty required files
- presence of `output/theme/theme-data.json`
- valid references to local theme assets
- successful ZIP output from `output/theme`

The static export must also be checked for:

- `output/public/index.html`
- `output/public/export-manifest.json`
- valid local page and asset references after rewrite
- successful ZIP output from `output/public`

Catalog handoff must also include:

- `output/catalog/products.csv`
- `output/catalog/collections.csv`
- `output/products.json`
- `output/collections.json`

## Live Deployment Steps

To bring the cloned site live:

1. Run the full crawl and generation pipeline against the target URL.
2. Run `node scripts/validate-theme.js` and `node scripts/validate-static-export.js` before any deployment handoff.
3. If deploying outside Shopify, upload the generated root `public/` directory or `output/public.zip` to the hosting platform document root such as `public_html/`.
4. Ensure the host serves nested folder routes with `index.html` and honors the generated `.htaccess` fallback rules where Apache or cPanel is used.
5. If deploying in Shopify, upload `output/theme.zip` to Shopify as the base theme.
6. Import `output/catalog/products.csv` into Shopify products.
7. Use `output/catalog/collections.csv` and `output/collections.json` to rebuild automated or manual collections.
8. Reconnect navigation and homepage featured content inside Shopify admin.
9. Replace unsupported third-party widgets with Shopify-safe equivalents.
10. QA the uploaded theme and static export against the source site across homepage, collection, product, and policy pages.

## Known Hard Limits

These areas are not expected to be cloned 1:1 automatically:

- checkout
- customer account flows
- personalized recommendations
- private API-backed widgets
- highly interactive SPA-only behavior
- app embeds tied to vendor runtime code

These should be documented as approximation areas rather than hidden behind fake success states.
