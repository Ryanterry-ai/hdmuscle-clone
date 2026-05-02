# Target Import Schema - Upgraded.co.in

## Overview

This document defines how `products_import_template.xlsx` MasterProducts sheet maps into the target backend database entities for Upgraded.co.in.

---

## 1. brands

### Purpose
Stores brand-level information for the multi-brand marketplace.

### Required fields
- `name`
- `slug`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| name | `brand` |
| slug | `brand_slug` |
| description | (rewritten) |
| logo | (uploaded separately) |
| is_active | (default: true) |

### Validation rules
- `name` must be non-empty
- `slug` must be unique, lowercase, hyphenated
- One brand record per unique `brand_slug`

### Example row
```json
{
  "name": "Upgraded Demo Nutrition",
  "slug": "upgraded-demo-nutrition",
  "description": "Premium Indian supplement brand",
  "logo": "/public/brand-logos/upgraded-demo-nutrition.webp",
  "is_active": true
}
```

---

## 2. categories

### Purpose
Defines the product category and subcategory hierarchy for navigation and filtering.

### Required fields
- `name`
- `slug`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| name | `category` |
| subcategory | `subcategory` |
| goal | `goal` |
| menu_group | (from CategoryMapping sheet) |
| is_active | `is_active` (from CategoryMapping sheet) |

### Validation rules
- Category must exist in CategoryMapping sheet
- `slug` must be unique and URL-safe
- Subcategory optional but must map to parent category

### Example row
```json
{
  "name": "Protein",
  "subcategory": "Whey Protein",
  "slug": "protein/whey-protein",
  "goal": "Muscle Building",
  "menu_group": "Protein",
  "is_active": true
}
```

---

## 3. products

### Purpose
Core product entity representing a unique product (not variant-level).

### Required fields
- `handle`
- `title`
- `brand_slug`
- `category_slug`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| handle | `product_handle` |
| title | `product_title` |
| brand_slug | `brand_slug` |
| category | `category` |
| subcategory | `subcategory` |
| short_description | `short_description` (rewritten) |
| long_description | `long_description` (rewritten) |
| product_type | `product_type` |
| source_product_url | `source_product_url` |
| source_website | `source_website` |

### Validation rules
- `handle` must be unique
- `title` must be non-empty
- Must reference valid `brand_slug`
- Must reference valid `category`

### Example row
```json
{
  "handle": "upgraded-demo-whey-protein-isolate",
  "title": "Upgraded Demo Whey Protein Isolate",
  "brand_slug": "upgraded-demo-nutrition",
  "category": "Protein",
  "subcategory": "Whey Protein",
  "short_description": "Premium whey protein isolate with 27g protein per serving for faster muscle recovery.",
  "long_description": "Upgraded Demo Whey Protein Isolate is crafted for athletes and fitness enthusiasts who demand the highest quality protein.",
  "product_type": "Whey Protein Isolate",
  "source_product_url": "",
  "source_website": "demo"
}
```

---

## 4. product_variants

### Purpose
Individual sellable variants (flavor/size combinations) of a product.

### Required fields
- `sku`
- `product_handle`
- `mrp`
- `sale_price`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| sku | `variant_sku` |
| product_handle | `product_handle` |
| flavor | `flavor` |
| size | `size` |
| variant_title | `variant_title` |
| barcode | `barcode` |
| mrp | `mrp` |
| sale_price | `sale_price` |
| cost_price | `cost_price` |
| wholesale_price | `wholesale_price` |
| distributor_price | `distributor_price` |
| currency | `currency` |
| tax_rate | `tax_rate` |

### Validation rules
- `sku` must be unique across ALL variants
- `mrp` must be numeric
- `sale_price` must be numeric
- `mrp >= sale_price`
- `cost_price <= wholesale_price <= mrp`
- `distributor_price <= wholesale_price`

### Example row
```json
{
  "sku": "UDN-WPI-CHOC-1KG",
  "product_handle": "upgraded-demo-whey-protein-isolate",
  "flavor": "Chocolate",
  "size": "1 kg",
  "variant_title": "Chocolate / 1 kg",
  "barcode": "8901234567001",
  "mrp": 2499,
  "sale_price": 1999,
  "cost_price": 1200,
  "wholesale_price": 1500,
  "distributor_price": 1350,
  "currency": "INR",
  "tax_rate": 18
}
```

---

## 5. product_images

### Purpose
Maps image files to products with type classification.

### Required fields
- `product_handle`
- `image_path`
- `image_type`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| product_handle | `product_handle` |
| image_path | `main_image`, `gallery_images`, `label_image`, `nutrition_image` |
| image_type | Derived: `main`, `gallery`, `label`, `nutrition` |
| alt_text | Derived from `product_title` |

### Validation rules
- `image_path` must start with `/public/product-images/`
- Image file must exist at the specified path
- `image_type` must be one of: `main`, `gallery`, `label`, `nutrition`
- Each product must have exactly one `main` image

### Example row
```json
{
  "product_handle": "upgraded-demo-whey-protein-isolate",
  "image_path": "/public/product-images/upgraded-demo-nutrition/upgraded-demo-whey-protein-isolate/main.webp",
  "image_type": "main",
  "alt_text": "Upgraded Demo Whey Protein Isolate Chocolate",
  "sort_order": 0
}
```

---

## 6. inventory

### Purpose
Tracks stock levels and availability per variant SKU.

### Required fields
- `sku`
- `stock`
- `stock_status`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| sku | `variant_sku` |
| stock | `stock` |
| stock_status | `stock_status` |
| min_order_quantity | `min_order_quantity` |
| case_pack_quantity | `case_pack_quantity` |
| batch_number | `batch_number` |
| expiry_date | `expiry_date` |

### Validation rules
- `stock` must be numeric >= 0
- `stock_status` must be: `in_stock`, `out_of_stock`, `low_stock`, `preorder`
- `batch_number` must only come from warehouse, distributor, invoice, or stock records
- `expiry_date` must only come from warehouse, distributor, invoice, or stock records
- SKU must exist in `product_variants`

### Example row
```json
{
  "sku": "UDN-WPI-CHOC-1KG",
  "stock": 150,
  "stock_status": "in_stock",
  "min_order_quantity": 1,
  "case_pack_quantity": 12,
  "batch_number": "",
  "expiry_date": "",
  "warehouse_location": "",
  "last_counted_at": ""
}
```

---

## 7. seo

### Purpose
Search engine optimization metadata for product pages.

### Required fields
- `product_handle`
- `seo_title`
- `seo_description`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| product_handle | `product_handle` |
| seo_title | `seo_title` |
| seo_description | `seo_description` |
| seo_keywords | `seo_keywords` |
| meta_canonical | `meta_canonical` |

### Validation rules
- `seo_title` should be under 70 characters
- `seo_description` should be under 160 characters
- `meta_canonical` must be valid URL format
- SEO content must be rewritten for Upgraded.co.in brand voice

### Example row
```json
{
  "product_handle": "upgraded-demo-whey-protein-isolate",
  "seo_title": "Whey Protein Isolate Chocolate 1kg | Upgraded.co.in",
  "seo_description": "Buy premium Whey Protein Isolate with 27g protein per serving. Authentic, lab-tested, fast delivery across India.",
  "seo_keywords": "whey protein isolate, protein powder, muscle building, post workout, chocolate protein",
  "meta_canonical": "https://upgraded.co.in/products/upgraded-demo-whey-protein-isolate",
  "og_image": "/public/product-images/upgraded-demo-nutrition/upgraded-demo-whey-protein-isolate/main.webp"
}
```

---

## 8. compliance_data

### Purpose
Regulatory and label compliance information required for Indian supplement marketplace.

### Required fields
- `product_handle`
- `ingredients`
- `nutrition_facts`
- `serving_size`
- `servings_per_container`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| product_handle | `product_handle` |
| ingredients | `ingredients` |
| nutrition_facts | `nutrition_facts` |
| serving_size | `serving_size` |
| servings_per_container | `servings_per_container` |
| directions | `directions` |
| warnings | `warnings` |
| allergen_info | `allergen_info` |
| manufacturer | `manufacturer` |
| importer | `importer` |
| country_of_origin | `country_of_origin` |

### Validation rules
- **FACTUAL DATA ONLY**: ingredients, nutrition_facts, serving_size, directions, warnings, allergen_info, manufacturer, importer must match product label exactly
- Must NOT be invented or rewritten
- `country_of_origin` must be a valid ISO country name
- Missing fields must be flagged with `needs_review = yes`

### Example row
```json
{
  "product_handle": "upgraded-demo-whey-protein-isolate",
  "ingredients": "Whey Protein Isolate, Cocoa Powder, Natural & Artificial Flavors, Lecithin, Digestive Enzymes",
  "nutrition_facts": "Per 30g serving: Protein 27g, Carbs 1g, Fat 0.5g, Sugar 0.5g, Calories 120 kcal",
  "serving_size": "30g (1 scoop)",
  "servings_per_container": "33",
  "directions": "Mix 1 scoop with 200-250ml of water or milk. Consume post-workout or between meals.",
  "warnings": "Consult your physician before use if you are under 18, pregnant, or have any medical condition.",
  "allergen_info": "Contains milk and soy. Manufactured in a facility that processes nuts, wheat, and eggs.",
  "manufacturer": "Upgraded Demo Nutrition Pvt Ltd, Mumbai, Maharashtra",
  "importer": "Upgraded Demo Nutrition Pvt Ltd, Mumbai, Maharashtra",
  "country_of_origin": "India",
  "fssai_license": "",
  "import_license": "",
  "needs_review": "no"
}
```

---

## 9. wholesale_pricing

### Purpose
B2B pricing tiers for gym owners, retailers, wholesalers, and distributors.

### Required fields
- `sku`
- `wholesale_price`
- `distributor_price`
- `min_order_quantity`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| sku | `variant_sku` |
| wholesale_price | `wholesale_price` |
| distributor_price | `distributor_price` |
| cost_price | `cost_price` |
| mrp | `mrp` |
| min_order_quantity | `min_order_quantity` |
| case_pack_quantity | `case_pack_quantity` |

### Validation rules
- `cost_price <= distributor_price <= wholesale_price <= mrp`
- All prices must be numeric
- SKU must exist in `product_variants`
- Wholesale tiers visible only to verified B2B accounts

### Example row
```json
{
  "sku": "UDN-WPI-CHOC-1KG",
  "cost_price": 1200,
  "wholesale_price": 1500,
  "distributor_price": 1350,
  "mrp": 2499,
  "min_order_quantity": 1,
  "case_pack_quantity": 12,
  "tier_gym_owner": 1500,
  "tier_retailer": 1450,
  "tier_wholesaler": 1350,
  "tier_distributor": 1300
}
```

---

## 10. brand_partner_data

### Purpose
Information for brand partners, authenticity messaging, and why-buy-from-upgraded content.

### Required fields
- `brand_slug`
- `authenticity_message`
- `why_buy_from_upgraded`

### Source columns from MasterProducts
| Target Field | Source Column |
|---|---|
| brand_slug | `brand_slug` |
| authenticity_message | `authenticity_message` |
| why_buy_from_upgraded | `why_buy_from_upgraded` |
| key_benefits | `key_benefits` |
| faq | `faq` |
| who_should_use_it | `who_should_use_it` |
| how_to_use_it | `how_to_use_it` |

### Validation rules
- All content must be **rewritten** for Upgraded.co.in brand voice
- Must NOT copy competitor marketing descriptions
- Must NOT invent medical claims
- Tone: premium, trustworthy, fitness-focused, India-market ready, authenticity-first

### Example row
```json
{
  "brand_slug": "upgraded-demo-nutrition",
  "authenticity_message": "100% authentic product sourced directly from the manufacturer. Verified with batch-level tracking.",
  "why_buy_from_upgraded": "Authentic products with batch-level verification, GST invoice, fast Pan-India delivery, and dedicated WhatsApp support.",
  "key_benefits": "27g protein per serving, Low carb and low fat, Fast absorption, Supports muscle recovery, Great taste, Easy to mix",
  "faq": "Q: When should I take it? A: Post-workout or between meals.\nQ: Can I take it with milk? A: Yes, mix with water or milk as preferred.",
  "who_should_use_it": "Athletes, bodybuilders, fitness enthusiasts, and anyone looking to increase their daily protein intake.",
  "how_to_use_it": "Mix one scoop with 200-250ml of water or milk. Take post-workout or between meals to meet daily protein goals."
}
```

---

## Image Storage Rules

All product images must follow this local path structure:

```
/public/product-images/brand-slug/product-handle/main.webp
/public/product-images/brand-slug/product-handle/gallery-01.webp
/public/product-images/brand-slug/product-handle/gallery-02.webp
/public/product-images/brand-slug/product-handle/label.webp
/public/product-images/brand-slug/product-handle/nutrition.webp
```

- Images must be converted to `.webp` format using Sharp
- Max dimensions: 1200x1200px
- Quality: 85%
- Competitor-hosted image URLs must NOT be used in production
- All images must be downloaded and stored locally before import

---

## Rewrite Rules

### Preserve exactly (DO NOT modify):
- `ingredients`
- `nutrition_facts`
- `serving_size`
- `servings_per_container`
- `directions` (label text)
- `warnings` (label text)
- `manufacturer`
- `importer`
- `batch_number`
- `expiry_date`
- `allergen_info`

### Must be rewritten for Upgraded.co.in:
- `short_description`
- `long_description`
- `key_benefits`
- `faq`
- `who_should_use_it`
- `how_to_use_it`
- `why_buy_from_upgraded`
- `seo_title`
- `seo_description`
- `seo_keywords`
- `authenticity_message`

### Content guidelines:
- Do NOT copy competitor marketing descriptions
- Do NOT invent medical claims
- Do NOT make health/disease/treatment claims
- Use Upgraded.co.in tone: **premium, trustworthy, fitness-focused, India-market ready, authenticity-first**
- Content must support goal-based shopping and Indian consumer confidence

---

## Validation Rules

| Rule | Condition |
|---|---|
| brand | Required, non-empty |
| product_title | Required, non-empty |
| product_handle | Required, non-empty, unique |
| category | Required, must exist in CategoryMapping |
| variant_sku | Required, unique across all rows |
| mrp | Must be numeric |
| sale_price | Must be numeric |
| mrp >= sale_price | Must hold true |
| stock | Must be numeric, >= 0 |
| main_image | Must start with `/public/product-images/` |
| needs_review | Must be `yes` or `no` |
| data_confidence | Must be `high`, `medium`, or `low` |
| seo_title | Should be under 70 characters |
| seo_description | Should be under 160 characters |

---

## Workflow Summary

```
1. Extract (extract-products.ts)
   └── Playwright + Cheerio -> data/extracted-products.json

2. Normalize (normalize-products.ts)
   └── Clean data -> data/normalized-products.json

3. Download Images (download-images.ts)
   └── Remote URLs -> local .webp files -> public/product-images/

4. Validate (validate-import.ts)
   └── Zod schema validation -> exports/validation-report.json

5. Export (export-tables.ts)
   └── Split into entity JSONs -> exports/*.json

6. Audit Images (audit-images.ts)
   └── Verify all referenced images exist -> logs/audit-images.log
```

Run all steps: `npm run run:all`
