import type {
  Brand, Category, Product, Variant, ProductImage,
  Inventory, SEO, Compliance, WholesalePricing, BrandPartner,
  ProductDetail, CategoryWithProducts, BrandWithProducts,
  GoalWithProducts, DealProduct, ImportValidationResult
} from './types';

export interface IBrandRepository {
  getAll(): Promise<Brand[]>;
  getBySlug(slug: string): Promise<Brand | null>;
  getAllWithProducts(): Promise<BrandWithProducts[]>;
}

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getUniqueCategories(): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
  getAllWithProducts(): Promise<CategoryWithProducts[]>;
}

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getByHandle(handle: string): Promise<Product | null>;
  getFeatured(limit?: number): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  getBestSellers(limit?: number): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
}

export interface IVariantRepository {
  getByProductHandle(handle: string): Promise<Variant[]>;
  getBySku(sku: string): Promise<Variant | null>;
  getAll(): Promise<Variant[]>;
}

export interface IImageRepository {
  getByProductHandle(handle: string): Promise<ProductImage[]>;
  getAll(): Promise<ProductImage[]>;
}

export interface IInventoryRepository {
  getByProductHandle(handle: string): Promise<Inventory[]>;
  getBySku(sku: string): Promise<Inventory | null>;
}

export interface ISEORepository {
  getByProductHandle(handle: string): Promise<SEO>;
}

export interface IComplianceRepository {
  getByProductHandle(handle: string): Promise<Compliance[]>;
}

export interface IWholesaleRepository {
  getByProductHandle(handle: string): Promise<WholesalePricing[]>;
  getBySku(sku: string): Promise<WholesalePricing | null>;
}

export interface IBrandPartnerRepository {
  getAll(): Promise<BrandPartner[]>;
  getByBrandSlug(slug: string): Promise<BrandPartner | null>;
}

export interface ICatalogService {
  getProductDetail(handle: string): Promise<ProductDetail | null>;
  getCategoriesWithProducts(): Promise<CategoryWithProducts[]>;
  getBrandsWithProducts(): Promise<BrandWithProducts[]>;
  getGoalsWithProducts(): Promise<GoalWithProducts[]>;
  getDeals(): Promise<DealProduct[]>;
  validateImport(data: any[]): Promise<ImportValidationResult>;
  applyImport(data: any[]): Promise<{ created: number; updated: number; errors: number }>;
}
