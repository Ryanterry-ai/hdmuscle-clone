# Morphogen Nutrition - Product Import Guide

## Step 1: Export Products from Original Store

Since you have admin access to `morphogennutrition.myshopify.com`:

1. Login to: https://admin.shopify.com/store/morphogennutrition/products
2. Click **Export** (top right)
3. Select:
   - **Export products**: All products
   - **Format**: CSV
   - **Include**: Images, Variants
4. Click **Export products**

This downloads a CSV file with all products.

---

## Step 2: Import to New Store

1. Login to your new store: `0h5kgk-cq.myshopify.com/admin`
2. Go to **Products** → Click **Import**
3. Upload the CSV file from Step 1
4. Click **Upload and continue**

---

## Step 3: Download Product Images

The images are hosted at:
```
https://www.morphogennutrition.com/cdn/shop/files/[filename]
```

You'll need to extract image URLs from the CSV and download them.

### Option A: Use a Download Script

Run this in your terminal to download images from the exported CSV:

```bash
# Install wget if not available, then:
while IFS= read -r line; do
  wget -P images/ "$line"
done < image_urls.txt
```

### Option B: Bulk Upload

1. After importing products, go to **Files** in Shopify admin
2. Upload all images
3. Images will auto-attach to products if filenames match

---

## Alternative: Use Shopify App (Easier)

Install these free apps from Shopify App Store:

1. **Matrixify** - Export/import with images
2. **Import Export Lite** - Simple bulk import
3. **SEO Batch Editor** - Import products with images

---

## Quick Fix: Manual Copy

If you can't access original store admin:

1. Visit each product page on morphogennutrition.com
2. Note: Title, description, price, images
3. Create products manually in new store
4. Upload images manually

---

## Need Help?

If you have access to the original Shopify admin, I can help you:
1. Navigate the export process
2. Extract product data programmatically
3. Generate a complete product import CSV