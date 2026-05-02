import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type {
  Brand, Category, Product, Variant, ProductImage,
  Inventory, SEO, Compliance, WholesalePricing, BrandPartner,
  ProductDetail, CategoryWithProducts, BrandWithProducts,
  GoalWithProducts, DealProduct, ImportValidationResult
} from './types';

import {
  IBrandRepository, ICategoryRepository, IProductRepository,
  IVariantRepository, IImageRepository, IInventoryRepository,
  ISEORepository, IComplianceRepository, IWholesaleRepository,
  IBrandPartnerRepository, ICatalogService
} from './repository';

import { parseCSV, parseProductsJSON } from './csv-parser';

export class CatalogData {
  private static instance: CatalogData;
  private loaded = false;

  brands: Brand[] = [];
  categories: Category[] = [];
  products: Product[] = [];
  variants: Variant[] = [];
  images: ProductImage[] = [];
  inventories: Inventory[] = [];
  seoRecords: SEO[] = [];
  complianceRecords: Compliance[] = [];
  wholesaleRecords: WholesalePricing[] = [];
  brandPartners: BrandPartner[] = [];
  private goalMap: Record<string, string> = {};

  private constructor() {}

  static getInstance(): CatalogData {
    if (!CatalogData.instance) {
      CatalogData.instance = new CatalogData();
    }
    return CatalogData.instance;
  }

  loadAll(): void {
    if (this.loaded) return;

    const rawProducts: any[] = parseProductsJSON();
    rawProducts.forEach((p: any) => {
      this.goalMap[p.product_handle] = p.goal || 'uncategorized';
    });

    this.products = rawProducts.map((p: any) => ({
      handle: p.product_handle,
      title: p.product_title,
      brand_slug: p.brand_slug,
      category: p.category,
      subcategory: p.subcategory,
      product_type: p.product_type || '',
      short_description: p.short_description,
      long_description: p.long_description,
      source_website: p.source_website,
      source_product_url: p.source_product_url,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    this.brands = parseCSV<any>('brands.csv').map((b: any) => ({
      ...b,
      is_active: b.is_active === '1' || b.is_active === true,
    }));

    this.categories = parseCSV<any>('categories.csv').map((c: any) => ({
      ...c,
      is_active: c.is_active === '1' || c.is_active === true,
    }));

    this.variants = parseCSV<any>('product_variants.csv').map((v: any) => ({
      sku: v.sku,
      product_handle: v.product_handle,
      flavor: v.flavor || '',
      size: v.size || '',
      variant_title: v.variant_title,
      barcode: v.barcode || '',
      mrp: Number(v.mrp),
      sale_price: Number(v.sale_price),
      cost_price: Number(v.cost_price),
      wholesale_price: Number(v.wholesale_price),
      distributor_price: Number(v.distributor_price),
      currency: v.currency,
      tax_rate: Number(v.tax_rate),
      created_at: v.created_at,
    }));

    this.images = parseCSV<any>('product_images.csv').map((i: any) => ({
      id: i.id,
      product_handle: i.product_handle,
      image_path: i.image_path,
      image_type: i.image_type as ProductImage['image_type'],
      alt_text: i.alt_text,
      sort_order: Number(i.sort_order),
    }));

    this.inventories = parseCSV<any>('inventory.csv').map((inv: any) => ({
      sku: inv.sku,
      product_handle: inv.product_handle,
      stock: Number(inv.stock),
      stock_status: inv.stock_status as Inventory['stock_status'],
      min_order_quantity: Number(inv.min_order_quantity),
      case_pack_quantity: Number(inv.case_pack_quantity),
      batch_number: inv.batch_number || '',
      expiry_date: inv.expiry_date || '',
      warehouse_location: inv.warehouse_location || '',
      last_counted_at: inv.last_counted_at || '',
      updated_at: inv.updated_at,
    }));

    this.seoRecords = parseCSV<any>('seo.csv').map((s: any) => ({
      product_handle: s.product_handle,
      variant_sku: s.variant_sku,
      seo_title: s.seo_title,
      seo_description: s.seo_description,
      seo_keywords: s.seo_keywords || '',
      meta_canonical: s.meta_canonical || '',
      og_image: s.og_image,
    }));

    this.complianceRecords = parseCSV<any>('compliance_data.csv').map((c: any) => ({
      product_handle: c.product_handle,
      variant_sku: c.variant_sku,
      ingredients: c.ingredients || '',
      nutrition_facts: c.nutrition_facts || '',
      serving_size: c.serving_size || '',
      servings_per_container: c.servings_per_container || '',
      directions: c.directions || '',
      warnings: c.warnings || '',
      allergen_info: c.allergen_info || '',
      manufacturer: c.manufacturer || '',
      importer: c.importer || '',
      country_of_origin: c.country_of_origin || '',
      fssai_license: c.fssai_license || '',
      import_license: c.import_license || '',
      needs_review: c.needs_review || '',
    }));

    this.wholesaleRecords = parseCSV<any>('wholesale_pricing.csv').map((w: any) => ({
      sku: w.sku,
      product_handle: w.product_handle,
      cost_price: Number(w.cost_price),
      wholesale_price: Number(w.wholesale_price),
      distributor_price: Number(w.distributor_price),
      mrp: Number(w.mrp),
      sale_price: Number(w.sale_price),
      min_order_quantity: Number(w.min_order_quantity),
      case_pack_quantity: Number(w.case_pack_quantity),
      tier_gym_owner: Number(w.tier_gym_owner),
      tier_retailer: Number(w.tier_retailer),
      tier_wholesaler: Number(w.tier_wholesaler),
      tier_distributor: Number(w.tier_distributor),
      currency: w.currency,
    }));

    this.brandPartners = parseCSV<any>('brand_partner_data.csv').map((bp: any) => ({
      brand_slug: bp.brand_slug,
      brand_name: bp.brand_name,
      authenticity_message: bp.authenticity_message || '',
      why_buy_from_upgraded: bp.why_buy_from_upgraded || '',
      key_benefits: bp.key_benefits || '',
      faq: bp.faq || '',
      who_should_use_it: bp.who_should_use_it || '',
      how_to_use_it: bp.how_to_use_it || '',
      updated_at: bp.updated_at || '',
    }));

    this.loaded = true;
  }

  getProductDetail(handle: string): ProductDetail | null {
    const product = this.products.find(p => p.handle === handle);
    if (!product) return null;

    return {
      product,
      variants: this.variants.filter(v => v.product_handle === handle),
      images: this.images.filter(i => i.product_handle === handle),
      inventories: this.inventories.filter(i => i.product_handle === handle),
      seo: this.seoRecords.find(s => s.product_handle === handle) || {
        product_handle: handle,
        variant_sku: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        meta_canonical: '',
        og_image: '',
      },
      compliance: this.complianceRecords.filter(c => c.product_handle === handle),
      wholesale: this.wholesaleRecords.filter(w => w.product_handle === handle),
    };
  }

  getGoalsWithProducts(): GoalWithProducts[] {
    const goalGroups: Record<string, Product[]> = {};
    this.products.forEach(p => {
      const goal = this.goalMap[p.handle] || 'uncategorized';
      if (!goalGroups[goal]) goalGroups[goal] = [];
      goalGroups[goal].push(p);
    });

    return Object.entries(goalGroups).map(([goal, products]) => ({
      goal,
      categories: [...new Set(products.map(p => p.category))],
      productCount: products.length,
      products: products.map(p => this.getProductDetail(p.handle)!).filter(Boolean),
    }));
  }

  getDeals(): DealProduct[] {
    const deals: DealProduct[] = [];
    const seenHandles = new Set<string>();

    this.products.forEach(p => {
      if (seenHandles.has(p.handle)) return;
      const variants = this.variants.filter(v => v.product_handle === p.handle);
      const hasDeal = variants.some(v => v.sale_price < v.mrp);
      if (hasDeal) {
        const bestVariant = variants.reduce((best, v) => {
          const bestDiscount = ((best.mrp - best.sale_price) / best.mrp) * 100;
          const currDiscount = ((v.mrp - v.sale_price) / v.mrp) * 100;
          return currDiscount > bestDiscount ? v : best;
        }, variants[0]);
        const discount_percent = Math.round(((bestVariant.mrp - bestVariant.sale_price) / bestVariant.mrp) * 100);
        const detail = this.getProductDetail(p.handle);
        if (detail) {
          deals.push({ product: detail, discount_percent });
          seenHandles.add(p.handle);
        }
      }
    });

    return deals;
  }

  validateImport(data: any[]): ImportValidationResult {
    const errors: ImportValidationResult['errors'] = [];
    let valid = 0;
    let invalid = 0;
    const importSkus = new Set<string>();

    data.forEach((row, index) => {
      const rowNum = index + 1;
      const sku = row.sku || 'unknown';
      let hasError = false;

      if (!row.sku) {
        errors.push({ row: rowNum, sku, field: 'sku', message: 'SKU is required', severity: 'error' });
        hasError = true;
      }
      if (!row.product_handle && !row.handle) {
        errors.push({ row: rowNum, sku, field: 'product_handle', message: 'Product handle is required', severity: 'error' });
        hasError = true;
      }
      if (row.sku && importSkus.has(row.sku)) {
        errors.push({ row: rowNum, sku, field: 'sku', message: 'Duplicate SKU in import data', severity: 'error' });
        hasError = true;
      }
      if (row.sku) importSkus.add(row.sku);

      if (row.mrp && row.sale_price && Number(row.sale_price) > Number(row.mrp)) {
        errors.push({ row: rowNum, sku, field: 'sale_price', message: 'Sale price exceeds MRP', severity: 'error' });
        hasError = true;
      }
      if (row.image_path && !row.image_path.startsWith('/public/product-images/')) {
        errors.push({ row: rowNum, sku, field: 'image_path', message: 'Image path must be local /public/product-images/ path', severity: 'warning' });
      }
      if (row.needs_review && !['yes', 'no', 'true', 'false'].includes(row.needs_review.toLowerCase())) {
        errors.push({ row: rowNum, sku, field: 'needs_review', message: 'Invalid needs_review value', severity: 'warning' });
      }

      hasError ? invalid++ : valid++;
    });

    return { total: data.length, valid, invalid, errors, preview: data.slice(0, 5) };
  }

  applyImport(data: any[]): { created: number; updated: number; errors: number } {
    let created = 0, updated = 0, errors = 0;
    try {
      const existing = parseProductsJSON();
      const existingHandles = new Set(existing.map((p: any) => p.product_handle));

      data.forEach(item => {
        const handle = item.product_handle || item.handle;
        if (!handle) { errors++; return; }
        if (existingHandles.has(handle)) {
          const idx = existing.findIndex((p: any) => p.product_handle === handle);
          existing[idx] = { ...existing[idx], ...item };
          updated++;
        } else {
          existing.push(item);
          created++;
        }
      });

      writeFileSync(
        resolve(process.cwd(), 'data', 'rewritten', 'products.json'),
        JSON.stringify(existing, null, 2),
        'utf-8'
      );
    } catch (e) {
      errors++;
    }
    return { created, updated, errors };
  }
}

class JsonBrandRepository implements IBrandRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getAll(): Promise<Brand[]> { return this.catalog.brands; }
  async getBySlug(slug: string): Promise<Brand | null> { return this.catalog.brands.find(b => b.slug === slug) || null; }
  async getAllWithProducts(): Promise<BrandWithProducts[]> {
    return this.catalog.brands.map(brand => ({
      brand,
      productCount: this.catalog.products.filter(p => p.brand_slug === brand.slug).length,
      products: this.catalog.products
        .filter(p => p.brand_slug === brand.slug)
        .map(p => this.catalog.getProductDetail(p.handle)!)
        .filter(Boolean),
    }));
  }
}

class JsonCategoryRepository implements ICategoryRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getAll(): Promise<Category[]> { return this.catalog.categories; }
  async getUniqueCategories(): Promise<Category[]> {
    const seen = new Set<string>();
    return this.catalog.categories.filter(c => seen.has(c.name) ? false : (seen.add(c.name), true));
  }
  async getBySlug(slug: string): Promise<Category | null> { return this.catalog.categories.find(c => c.slug === slug) || null; }
  async getAllWithProducts(): Promise<CategoryWithProducts[]> {
    const unique = await this.getUniqueCategories();
    return unique.map(cat => ({
      category: cat,
      productCount: this.catalog.products.filter(p => p.category === cat.name).length,
      products: this.catalog.products
        .filter(p => p.category === cat.name)
        .map(p => this.catalog.getProductDetail(p.handle)!)
        .filter(Boolean),
    }));
  }
}

class JsonProductRepository implements IProductRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getAll(): Promise<Product[]> { return this.catalog.products; }
  async getByHandle(handle: string): Promise<Product | null> { return this.catalog.products.find(p => p.handle === handle) || null; }
  async getFeatured(limit = 10): Promise<Product[]> { return this.catalog.products.slice(0, limit); }
  async getNewArrivals(limit = 10): Promise<Product[]> {
    return [...this.catalog.products].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, limit);
  }
  async getBestSellers(limit = 10): Promise<Product[]> {
    return this.catalog.products
      .map(p => ({
        product: p,
        stock: this.catalog.inventories.filter(i => i.product_handle === p.handle).reduce((sum, i) => sum + i.stock, 0),
      }))
      .sort((a, b) => b.stock - a.stock)
      .map(x => x.product)
      .slice(0, limit);
  }
  async search(query: string): Promise<Product[]> {
    const q = query.toLowerCase();
    return this.catalog.products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.short_description.toLowerCase().includes(q) ||
      p.brand_slug.toLowerCase().includes(q)
    );
  }
}

class JsonVariantRepository implements IVariantRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getByProductHandle(handle: string): Promise<Variant[]> { return this.catalog.variants.filter(v => v.product_handle === handle); }
  async getBySku(sku: string): Promise<Variant | null> { return this.catalog.variants.find(v => v.sku === sku) || null; }
  async getAll(): Promise<Variant[]> { return this.catalog.variants; }
}

class JsonImageRepository implements IImageRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getByProductHandle(handle: string): Promise<ProductImage[]> { return this.catalog.images.filter(i => i.product_handle === handle); }
  async getAll(): Promise<ProductImage[]> { return this.catalog.images; }
}

class JsonInventoryRepository implements IInventoryRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getByProductHandle(handle: string): Promise<Inventory[]> { return this.catalog.inventories.filter(i => i.product_handle === handle); }
  async getBySku(sku: string): Promise<Inventory | null> { return this.catalog.inventories.find(i => i.sku === sku) || null; }
}

class JsonSEORepository implements ISEORepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getByProductHandle(handle: string): Promise<SEO> {
    return this.catalog.seoRecords.find(s => s.product_handle === handle) || {
      product_handle: handle,
      variant_sku: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      meta_canonical: '',
      og_image: '',
    };
  }
}

class JsonComplianceRepository implements IComplianceRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getByProductHandle(handle: string): Promise<Compliance[]> {
    return this.catalog.complianceRecords.filter(c => c.product_handle === handle);
  }
}

class JsonWholesaleRepository implements IWholesaleRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getByProductHandle(handle: string): Promise<WholesalePricing[]> {
    return this.catalog.wholesaleRecords.filter(w => w.product_handle === handle);
  }
  async getBySku(sku: string): Promise<WholesalePricing | null> {
    return this.catalog.wholesaleRecords.find(w => w.sku === sku) || null;
  }
}

class JsonBrandPartnerRepository implements IBrandPartnerRepository {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getAll(): Promise<BrandPartner[]> { return this.catalog.brandPartners; }
  async getByBrandSlug(slug: string): Promise<BrandPartner | null> {
    return this.catalog.brandPartners.find(bp => bp.brand_slug === slug) || null;
  }
}

class JsonCatalogService implements ICatalogService {
  private catalog = CatalogData.getInstance();
  constructor() { this.catalog.loadAll(); }

  async getProductDetail(handle: string): Promise<ProductDetail | null> { return this.catalog.getProductDetail(handle); }
  async getCategoriesWithProducts(): Promise<CategoryWithProducts[]> { return new JsonCategoryRepository().getAllWithProducts(); }
  async getBrandsWithProducts(): Promise<BrandWithProducts[]> { return new JsonBrandRepository().getAllWithProducts(); }
  async getGoalsWithProducts(): Promise<GoalWithProducts[]> { return this.catalog.getGoalsWithProducts(); }
  async getDeals(): Promise<DealProduct[]> { return this.catalog.getDeals(); }
  async validateImport(data: any[]): Promise<ImportValidationResult> { return this.catalog.validateImport(data); }
  async applyImport(data: any[]): Promise<{ created: number; updated: number; errors: number }> { return this.catalog.applyImport(data); }
}

export const brandRepository = new JsonBrandRepository();
export const categoryRepository = new JsonCategoryRepository();
export const productRepository = new JsonProductRepository();
export const variantRepository = new JsonVariantRepository();
export const imageRepository = new JsonImageRepository();
export const inventoryRepository = new JsonInventoryRepository();
export const seoRepository = new JsonSEORepository();
export const complianceRepository = new JsonComplianceRepository();
export const wholesaleRepository = new JsonWholesaleRepository();
export const brandPartnerRepository = new JsonBrandPartnerRepository();
export const catalogService = new JsonCatalogService();
