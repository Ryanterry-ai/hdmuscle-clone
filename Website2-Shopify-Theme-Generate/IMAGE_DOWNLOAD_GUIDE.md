# Image Extraction & Download Guide

## Option 1: Run Scripts (Recommended)

### Prerequisites
You need Node.js installed. Then:

```bash
# 1. Navigate to project folder
cd Website2-Shopify-Theme-Generate

# 2. Install dependencies
npm install playwright

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Run the full scrape (extract + download)
node scripts/full-scrape.js
```

This will:
- ✅ Extract all product image URLs from the website
- ✅ Download all images to `./product-images/` folder
- ✅ Save URLs to `./image-urls.json`

---

## Option 2: Quick Commands

### Step 1: Extract URLs
```bash
node scripts/playwright-extract.js
```

### Step 2: Download Images
```bash
node scripts/playwright-download.js
```

---

## Option 3: Manual Download

### Image URLs Pattern
```
https://www.morphogennutrition.com/cdn/shop/files/[PRODUCT_NAME].jpg
```

### Quick Download List
Download these main product images:

| Product | URL |
|---------|-----|
| Logo | https://www.morphogennutrition.com/cdn/shop/files/LOGO_WEB_GRID.png |
| Brand | https://www.morphogennutrition.com/cdn/shop/files/BRAND_NAME_LOGO.webp |
| BCAA | https://www.morphogennutrition.com/cdn/shop/files/BCAA.jpg |
| Creatine | https://www.morphogennutrition.com/cdn/shop/files/Creatine.jpg |
| PreWorkout | https://www.morphogennutrition.com/cdn/shop/files/PreWorkout.jpg |
| Protein | https://www.morphogennutrition.com/cdn/shop/files/Whey.jpg |
| Fat Burner | https://www.morphogennutrition.com/cdn/shop/files/FatBurner.jpg |
| Multi | https://www.morphogennutrition.com/cdn/shop/files/Multi.jpg |
| Fish Oil | https://www.morphogennutrition.com/cdn/shop/files/FishOil.jpg |

---

## After Images are Downloaded

### Store in Theme (Option A)
1. Place images in: `assets/images/`
2. Reference in theme like: `{{ 'image-name.jpg' | asset_url }}`

### Upload to Shopify (Option B)
1. Go to: **Shopify Admin → Files**
2. Click **Upload files**
3. Select all images from `product-images/`
4. They'll be available in product editors

### Manually Add to Products (Option C)
1. Go to: **Shopify Admin → Products**
2. Open each product
3. Click **Add image** → Select from uploaded files

---

## Output Location

All images will be saved to:
```
Website2-Shopify-Theme-Generate/product-images/
```

Files created:
- `image-urls.json` - List of all extracted URLs
- `product-images/` - Folder with all downloaded images