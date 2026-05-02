# Upgraded.co.in Product Data Extraction Toolkit

Complete local product data extraction, normalization, image download, content rewrite, Excel/CSV import, validation, report generation, and export toolkit for **Upgraded.co.in** — a premium Indian multi-brand supplement marketplace.

## Quick Start

```bash
# Install dependencies
npm install
npx playwright install chromium

# Create import template with sample data
npm run create:template

# Run the full pipeline
npm run run:all
```

## Pipeline Steps (Run in Order)

```bash
# Step 1: Create Excel template + sample CSV
npm run create:template

# Step 2: Normalize data (reads CSV/XLSX/JSON → writes to data/normalized/)
npm run normalize

# Step 3: Rewrite marketing content for Upgraded.co.in brand voice
npm run rewrite

# Step 4: Download and convert product images to local .webp
npm run download:images

# Step 5: Validate all data against schema rules
npm run validate

# Step 6: Export to 10 backend-ready CSV files
npm run export

# Step 7: Audit local image files
npm run audit:images

# Step 7.5: Auto-map uploaded product images to products (optional, for new image uploads)
npm run map:images -- --dir /path/to/uploaded-images

# Step 7.6: Sync mapped images back to product data (after mapping)
npm run sync:images

# Step 8: Generate missing data and source audit reports
npm run reports
```

# Run entire pipeline sequentially
npm run run:all
```

## Script Options

```bash
# Extract products from a source website
npm run extract -- --source https://example.com/products --max 100

# Normalize from different input formats
npm run normalize -- --input products_import_template.xlsx --output data/normalized/products.json
npm run normalize -- --input data/raw/extracted.json --output data/normalized/products.json --csv data/normalized/products.csv

# Rewrite with dry-run preview
npm run rewrite -- --dry-run

# Validate with verbose output
npm run validate -- --verbose --csv exports/validation_report.csv

# Export as JSON instead of CSV
npm run export -- --format json

# Convert existing images to .webp
npx tsx scripts/convert-images.ts --dir public/product-images --remove-original
```

## Folder Structure

```
project-root/
├── scripts/
│   ├── create-template.ts       # Generate Excel template + sample CSV
│   ├── extract-products.ts      # Playwright + Cheerio web extraction framework
│   ├── normalize-products.ts    # Normalize CSV/XLSX/JSON → import format
│   ├── download-images.ts       # Download images → local .webp via Sharp
│   ├── convert-images.ts        # Batch convert existing images to .webp
│   ├── rewrite-content.ts       # Rewrite marketing fields for Upgraded.co.in voice
│   ├── validate-import.ts       # Zod schema validation + report generation
│   ├── export-tables.ts         # Split into 10 backend-ready CSV files
│   ├── audit-images.ts          # Verify local image paths exist and are valid
│   ├── map-uploaded-images.ts   # Auto-map incoming images to products by SKU/handle/title
│   ├── sync-product-images.ts   # Sync local image files to product data and update exports
│   ├── generate-reports.ts      # Missing data + source audit + summary reports
│   └── run-all.ts               # Orchestrates the complete pipeline
├── products_import_template.xlsx    # Master Excel template (5 sheets, 62 columns)
├── sample_product_data.csv          # Sample data with 3 demo products
├── target_import_schema.md          # Backend entity mapping documentation
├── exports/                         # Generated CSV files for backend import
│   ├── brands.csv
│   ├── categories.csv
│   ├── products.csv
│   ├── product_variants.csv
│   ├── product_images.csv
│   ├── inventory.csv
│   ├── seo.csv
│   ├── compliance_data.csv
│   ├── wholesale_pricing.csv
│   ├── brand_partner_data.csv
│   ├── validation_report.csv
│   ├── image_audit_report.csv
│   ├── missing_data_report.csv
│   └── source_audit_report.csv
├── data/
│   ├── raw/                     # Raw extracted data from source websites
│   ├── normalized/              # Normalized product data (JSON + CSV)
│   └── rewritten/               # Rewritten marketing content
├── public/product-images/       # Local product image storage
├── logs/                        # Operation logs for each script
├── .env.example                 # Environment variable template
├── README.md                    # This file
└── package.json                 # Dependencies and scripts
```

## Template Sheets

The `products_import_template.xlsx` contains 5 sheets:

1. **MasterProducts** — 62-column product data structure with 3 demo products
2. **ValidationReport** — Issue tracking (row, SKU, issue type, severity)
3. **DataDictionary** — Complete field definitions for all 62 columns
4. **CategoryMapping** — Category/subcategory/goal mappings for supplement marketplace
5. **ImportInstructions** — 10 rules for data preparation

## Demo Products

Three safe demo products are included:

| Brand | Product | Category |
|---|---|---|
| Upgraded Demo Nutrition | Whey Protein Isolate (Chocolate, 1kg) | Protein |
| Demo Performance Labs | Pre-Workout Energy (Blue Raspberry, 300g) | Pre-Workout |
| Sample Wellness Co | Creatine Monohydrate (Unflavored, 250g) | Creatine |

## Tech Stack

- **Playwright** — Browser-based product extraction with robots.txt respect
- **Cheerio** — Static HTML parsing with 20+ generic product selectors
- **ExcelJS** — XLSX template creation and reading
- **Sharp** — Image conversion to optimized .webp format
- **Zod v3** — Schema validation with type coercion
- **CSV Parse/Stringify** — CSV input/output handling
- **CLI Progress** — Download and conversion progress bars
- **Winston** — Structured logging to /logs/
- **Slugify** — URL-safe handle and slug generation
- **Commander** — CLI argument parsing for all scripts
- **robots-parser** — Robots.txt compliance checking
- **Turndown** — HTML to Markdown conversion
- **html-to-text** — Clean text extraction from HTML
- **sanitize-html** — HTML sanitization before parsing

## How Each Script Works

### create-template
Generates `products_import_template.xlsx` with 5 sheets and `sample_product_data.csv`. Always safe to re-run.

### extract-products
Playwright browser automation framework. Accepts `--source <url>` argument. Checks robots.txt before extraction. Uses 20+ generic CSS selectors to find product listings and details. Saves raw data to `/data/raw/`. Respects delays between requests. Does not bypass login, paywalls, or anti-bot systems.

### normalize-products
Reads CSV, XLSX, or JSON input. Normalizes slugs, handles, prices, stock, and image paths. Outputs JSON to `/data/normalized/` and optional CSV. Generates normalization summary.

### download-images
Reads source image URLs from product data. Downloads via native HTTP fetch (no browser overhead). Converts to .webp using Sharp (1200x1200 max, 85% quality). Stores under `/public/product-images/brand-slug/product-handle/`. Skips already-downloaded files.

### convert-images
Batch converts existing images in `/public/product-images/` to .webp. Supports all common image formats. Optional `--remove-original` flag.

### rewrite-content
Rewrites ONLY marketing fields: `short_description`, `long_description`, `key_benefits`, `faq`, `who_should_use_it`, `how_to_use_it`, `why_buy_from_upgraded`, `seo_title`, `seo_description`, `authenticity_message`.

PRESERVES EXACTLY: `ingredients`, `nutrition_facts`, `serving_size`, `servings_per_container`, `directions`, `warnings`, `allergen_info`, `manufacturer`, `importer`, `country_of_origin`, `batch_number`, `expiry_date`.

Uses Upgraded.co.in brand voice: premium, trustworthy, fitness-focused, India-market ready, authenticity-first.

### validate-import
Validates all 62 columns against Zod schemas. Checks required fields, unique SKUs, numeric prices, MRP >= sale_price, image paths, needs_review values, data_confidence values. Writes validation report to `/exports/validation_report.json` and `/exports/validation_report.csv`.

### export-tables
Splits MasterProducts data into 10 backend-ready CSV files matching Upgraded.co.in import schema: brands, categories, products, product_variants, product_images, inventory, seo, compliance_data, wholesale_pricing, brand_partner_data. Defaults to CSV output.

### audit-images
Checks all referenced local image paths. Verifies files exist on disk. Reports missing images with product handles and expected paths. Writes audit report to `/exports/image_audit_report.csv`.

### map-uploaded-images
Scans a directory of incoming product images and automatically maps them to existing products using a 4-level priority system: exact variant_sku > exact brand_slug+product_handle > exact product_handle > fuzzy title match. Supports 5 filename patterns. Detects special filenames (label, nutrition, gallery-*) for correct image type assignment. Converts all images to optimized .webp via Sharp. Generates 3 CSV reports (mapped, unmapped, duplicates). Supports `--dry-run` and `--overwrite` flags.

### sync-product-images
Scans the local image directory recursively and updates `data/rewritten/products.json` with correct local image paths. Regenerates `exports/product_images.csv` and `exports/product_images_summary.csv`. Automatically detects and removes duplicate files. Use after `map-uploaded-images` to sync the mapped images back into the product data pipeline.

### generate-reports
Creates three reports:
- `missing_data_report.csv` — Lists all missing required, compliance, and marketing fields
- `source_audit_report.csv` — Checks for competitor domain URLs in source data
- `summary_report.json` — Overall data completeness, review status, and source audit summary

## How to Upload and Auto-Map Product Images

When you receive new product images from brands, suppliers, or photographers, use the image mapping pipeline to automatically match them to existing products.

### Step 1: Place images in a folder

Collect all incoming images in a single directory. The script supports these filename patterns:

| Pattern | Example | Match Priority |
|---|---|---|
| `{variant_sku}.{ext}` | `HD-WP-001-BR.jpg` | 1 (highest) |
| `{brand_slug}-{product_handle}.{ext}` | `hd-muscle-whey-protein.png` | 2 |
| `{product_handle}.{ext}` | `whey-protein.webp` | 3 |
| `{product_handle}-gallery-{N}.{ext}` | `whey-protein-gallery-1.jpg` | 3 (gallery) |
| Fuzzy product title match | `Whey Protein Isolate Chocolate.jpg` | 4 (fallback) |

Special filenames are auto-detected:
- `label`, `nutrition`, `ingredients` → assigned to label/nutrition image fields
- `gallery-01`, `gallery-02`, etc. → assigned to gallery image slots

### Step 2: Run the mapping script (dry-run first)

```bash
# Preview what will happen without making changes
npm run map:images -- --dir /path/to/uploaded-images

# Specify output directory for mapped images (defaults to /public/product-images/)
npm run map:images -- --dir /path/to/uploaded-images --output public/product-images

# Force overwrite of existing images
npm run map:images -- --dir /path/to/uploaded-images --overwrite
```

The script outputs three CSV reports:
- `exports/mapped_images.csv` — Successfully mapped images with source → destination paths
- `exports/unmapped_images.csv` — Images that could not be matched to any product
- `exports/duplicate_images.csv` — Images that would overwrite existing files (unless `--overwrite`)

All images are automatically converted to optimized `.webp` (1200x1200 max, 85% quality).

### Step 3: Sync mapped images to product data

After mapping, update the product data files and export CSVs:

```bash
# Update data/rewritten/products.json and exports/product_images.csv
npm run sync:images
```

### Step 4: Verify

```bash
# Run validation to confirm image paths are correct
npm run validate

# Audit all image files
npm run audit:images
```

### Image Mapping Script Details

```bash
# Full options
npx tsx scripts/map-uploaded-images.ts --dir <path> --output <path> --overwrite --dry-run --verbose

# Full sync options
npx tsx scripts/sync-product-images.ts --images-dir <path> --data <path> --verbose
```

## How to Add Source Website URLs Later

```bash
# Single website extraction
npm run extract -- --source https://supplier.com/products --max 200

# Multiple websites (run sequentially)
npm run extract -- --source https://brand1.com/products --max 100 --output data/raw/brand1.json
npm run extract -- --source https://brand2.com/products --max 100 --output data/raw/brand2.json

# Then normalize the extracted data
npm run normalize -- --input data/raw/brand1.json --output data/normalized/brand1.json
```

## Image Storage Rules

All product images must be stored locally under:
```
/public/product-images/brand-slug/product-handle/main.webp
/public/product-images/brand-slug/product-handle/gallery-01.webp
/public/product-images/brand-slug/product-handle/gallery-02.webp
/public/product-images/brand-slug/product-handle/label.webp
/public/product-images/brand-slug/product-handle/nutrition.webp
```

- Max dimensions: 1200x1200px
- Format: .webp only
- Quality: 85%
- Competitor-hosted image URLs must NOT be used in production
- All images must be downloaded and converted before import

## Fields That Must NOT Be Invented

The following fields must come ONLY from product labels, invoices, warehouse records, or authorized sources:

- `ingredients` — Must match product label exactly
- `nutrition_facts` — Must match product label exactly
- `serving_size` — Must match product label exactly
- `servings_per_container` — Must match product label exactly
- `directions` — Must match product label exactly
- `warnings` — Must match product label exactly
- `allergen_info` — Must match product label exactly
- `manufacturer` — Must match product label or authorized records
- `importer` — Must match invoice or FSSAI records
- `country_of_origin` — Must match product label
- `batch_number` — Must come from warehouse, distributor, invoice, or stock records
- `expiry_date` — Must come from warehouse, distributor, invoice, or stock records

## How needs_review Works

Every product row has a `needs_review` field:

| Value | Meaning |
|---|---|
| `yes` | Row requires manual review before import |
| `no` | Row is ready for import |

Auto-set to `yes` when:
- Marketing content is auto-generated by rewrite-content.ts
- Factual compliance fields are missing
- Data confidence is low or medium
- Image paths reference non-local files
- Source URLs contain competitor domains

Manual review checklist:
1. Verify all factual fields match the product label
2. Review rewritten marketing content for brand voice alignment
3. Confirm pricing matches distributor agreements
4. Check that batch_number and expiry_date are from warehouse records
5. Verify all image files exist locally

## How to Fix Validation Errors

1. **Missing required fields**: Fill the field from product label or source data
2. **Duplicate SKUs**: Assign unique `variant_sku` for each variant row
3. **MRP < sale_price**: Correct pricing to ensure MRP >= sale_price
4. **Invalid image paths**: Download images and update paths to `/public/product-images/`
5. **Invalid needs_review value**: Set to `yes` or `no`
6. **Invalid data_confidence**: Set to `high`, `medium`, or `low`
7. **SEO title too long**: Shorten to under 70 characters
8. **SEO description too long**: Shorten to under 160 characters

Run validation after fixes:
```bash
npm run validate -- --verbose
```

## Backend Entity Mapping

See `target_import_schema.md` for complete documentation of how the MasterProducts sheet maps to 10 backend entities:

1. **brands** — Brand-level information
2. **categories** — Category/subcategory hierarchy
3. **products** — Core product entities
4. **product_variants** — Sellable variant records
5. **product_images** — Image file mappings
6. **inventory** — Stock levels and availability
7. **seo** — Search engine metadata
8. **compliance_data** — Regulatory and label compliance
9. **wholesale_pricing** — B2B pricing tiers
10. **brand_partner_data** — Authenticity and brand messaging

## Website Role Matrix

| Website | Role |
|---|---|
| **hdmuscle.in** | Owned/internal visual and PDP reference |
| **morphogennutrition.com** | Premium credibility and trust structure inspiration |
| **bodybuilding.com** | Marketplace navigation and category architecture reference |

Do not copy competitor content, images, code, or proprietary assets from any reference website.
