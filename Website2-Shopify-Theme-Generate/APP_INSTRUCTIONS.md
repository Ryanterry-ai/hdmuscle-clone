# Shopify App Setup Instructions

## Step 1: Configure Scopes

In the Shopify admin page you're in, under **Scopes**:

Enter this:
```
write_products
```

Click **Save**

## Step 2: Install the App

Click the **Install app** button (usually at the top right)

## Step 3: Get the API Token

After installing, you'll see an **Access token** displayed:

- Copy the token (starts with `shpat_` - NOT `shpss_`)
- This is your Admin API token

## Step 4: Run Import

Then come back here and run:
```bash
$env:SHOPIFY_TOKEN = "shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
node scripts/shopify-import.js
```

---

## Alternative: Manual CSV Import (Easier!)

1. Go to: https://admin.shopify.com/products
2. Click **Add product** → **Import**
3. Upload this file:
   ```
   Website2-Shopify-Theme-Generate/output/export/products.csv
   ```
4. Click **Import**

This is the fastest way - no token needed!