# Shopify Import Guide

## Files Ready for Import

### 1. Products Import CSV
**File:** `output/export/products.csv`

**Shopify Admin Import:**
1. Go to https://admin.shopify.com/products
2. Click "Add product" → "Import"
3. Upload `products.csv`
4. Map fields if needed

### 2. Collections Import CSV
**File:** `output/export/collections.csv`

**Create Collections Manually:**
1. Go to https://admin.shopify.com/products/collections
2. Click "Create collection"
3. Enter each collection from the CSV:
   - `premiumsupplements` - Title: "All Products"
   - `health-series` - Title: "Health Series"
   - `max-series` - Title: "Max Series"
   - `sport-series` - Title: "Sport Series"
   - `wellness-series` - Title: "Wellness Series"
   - `lifestyle` - Title: "Apparel"
   - `stacks` - Title: "Bundles"
   - `new` - Title: "New Products"

### 3. Product Images
**Folder:** `assets/product-images/`

**Upload Images:**
1. Go to https://admin.shopify.com/settings/files
2. Drag & drop all images from `assets/product-images/`
3. Or use bulk upload

---

## Alternative: Use Shopify CLI

```bash
# Install Shopify CLI
npm install -g @shopify/cli

# Login to store
shopify auth login

# Import products
shopify product import output/export/products.csv

# Push theme
shopify theme push --store=0h5kgk-cq.myshopify.com
```

---

## Alternative: Use API Script

If you have Shopify API credentials (Admin API access token), use the included API import script:

```bash
# Set environment variables
export SHOPIFY_STORE="0h5kgk-cq.myshopify.com"
export SHOPIFY_ACCESS_TOKEN="your_admin_api_token"

# Run import
node scripts/import-products-api.js
```

---

## Recommended Workflow

### Step 1: Create Collections First
The products CSV will reference collections - create them first.

### Step 2: Upload Images to Shopify Files
Images must be uploaded before or during product import.

### Step 3: Import Products
Upload the CSV file.

### Step 4: Assign Products to Collections
After import, go through each collection and add products.

---

## Products Data Summary

- **Total Products:** 96
- **Total Images:** 100
- **Collections:** 8
- **Vendors:** Morphogen Nutrition

## File Locations
```
Website2-Shopify-Theme-Generate/
├── output/
│   ├── export/products.csv      ← IMPORT THIS
│   ├── export/collections.csv
│   ├── export/products.json
│   └── morphogen-theme.zip
└── assets/
    └── product-images/       ← UPLOAD TO SHOPIFY FILES
```