// Brand
export interface Brand {
  name: string;
  slug: string;
  description: string;
  logo: string;
  is_active: boolean;
  country_of_origin: string;
  created_at: string;
}

// Category
export interface Category {
  name: string;
  subcategory: string;
  slug: string;
  goal: string;
  menu_group: string;
  is_active: boolean;
}

// Product (from products.csv - one per unique handle)
export interface Product {
  handle: string;
  title: string;
  brand_slug: string;
  category: string;
  subcategory: string;
  product_type: string;
  short_description: string;
  long_description: string;
  source_website: string;
  source_product_url: string;
  created_at: string;
  updated_at: string;
}

// Variant
export interface Variant {
  sku: string;
  product_handle: string;
  flavor: string;
  size: string;
  variant_title: string;
  barcode: string;
  mrp: number;
  sale_price: number;
  cost_price: number;
  wholesale_price: number;
  distributor_price: number;
  currency: string;
  tax_rate: number;
  created_at: string;
}

// Product Image
export interface ProductImage {
  id: string;
  product_handle: string;
  image_path: string;
  image_type: 'main' | 'gallery' | 'label' | 'nutrition';
  alt_text: string;
  sort_order: number;
}

// Inventory
export interface Inventory {
  sku: string;
  product_handle: string;
  stock: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock' | 'preorder';
  min_order_quantity: number;
  case_pack_quantity: number;
  batch_number: string;
  expiry_date: string;
  warehouse_location: string;
  last_counted_at: string;
  updated_at: string;
}

// SEO
export interface SEO {
  product_handle: string;
  variant_sku: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  meta_canonical: string;
  og_image: string;
}

// Compliance
export interface Compliance {
  product_handle: string;
  variant_sku: string;
  ingredients: string;
  nutrition_facts: string;
  serving_size: string;
  servings_per_container: string;
  directions: string;
  warnings: string;
  allergen_info: string;
  manufacturer: string;
  importer: string;
  country_of_origin: string;
  fssai_license: string;
  import_license: string;
  needs_review: string;
}

// Wholesale
export interface WholesalePricing {
  sku: string;
  product_handle: string;
  cost_price: number;
  wholesale_price: number;
  distributor_price: number;
  mrp: number;
  sale_price: number;
  min_order_quantity: number;
  case_pack_quantity: number;
  tier_gym_owner: number;
  tier_retailer: number;
  tier_wholesaler: number;
  tier_distributor: number;
  currency: string;
}

// Brand Partner
export interface BrandPartner {
  brand_slug: string;
  brand_name: string;
  authenticity_message: string;
  why_buy_from_upgraded: string;
  key_benefits: string;
  faq: string;
  who_should_use_it: string;
  how_to_use_it: string;
  updated_at: string;
}

// Combined Product Detail (assembled from all sources)
export interface ProductDetail {
  product: Product;
  variants: Variant[];
  images: ProductImage[];
  inventories: Inventory[];
  seo: SEO;
  compliance: Compliance[];
  wholesale: WholesalePricing[];
}

// Aggregated Category with products
export interface CategoryWithProducts {
  category: Category;
  productCount: number;
  products: ProductDetail[];
}

// Aggregated Brand with products
export interface BrandWithProducts {
  brand: Brand;
  productCount: number;
  products: ProductDetail[];
}

// Goal aggregation
export interface GoalWithProducts {
  goal: string;
  categories: string[];
  productCount: number;
  products: ProductDetail[];
}

// Deal product (products with sale_price < mrp)
export interface DealProduct {
  product: ProductDetail;
  discount_percent: number;
}

// Import validation result
export interface ImportValidationResult {
  total: number;
  valid: number;
  invalid: number;
  errors: { row: number; sku: string; field: string; message: string; severity: 'error' | 'warning' }[];
  preview: any[];
}
