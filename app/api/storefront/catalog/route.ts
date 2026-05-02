import { NextResponse } from 'next/server';
import { CatalogData } from '@/lib/data/json-repository';

const catalog = CatalogData.getInstance();
catalog.loadAll();

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = catalog.categories.map(c => ({
    name: c.name,
    subcategory: c.subcategory,
    slug: c.slug,
    goal: c.goal,
    productCount: catalog.products.filter(p => p.category === c.name).length,
  })).filter(c => c.productCount > 0);

  const brands = catalog.brands.map(brand => ({
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    description: brand.description,
    productCount: catalog.products.filter(p => p.brand_slug === brand.slug).length,
  }));

  const goals = catalog.getGoalsWithProducts().filter(g => g.productCount > 0).map(g => ({
    goal: g.goal,
    slug: g.goal.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    productCount: g.productCount,
    categories: g.categories,
  }));

  const allProducts = catalog.products.map(p => {
    const variant = catalog.variants.find(v => v.product_handle === p.handle);
    const image = catalog.images.find(i => i.product_handle === p.handle && i.image_type === 'main');
    return {
      handle: p.handle,
      title: p.title,
      brand_slug: p.brand_slug,
      brand: catalog.brands.find(b => b.slug === p.brand_slug)?.name || '',
      category: p.category,
      mrp: variant?.mrp || 0,
      salePrice: variant?.sale_price || variant?.mrp || 0,
      mainImage: image?.image_path || '',
      short_description: p.short_description,
    };
  });

  const dealsCount = new Set(
    catalog.variants.filter(v => v.sale_price < v.mrp).map(v => v.product_handle)
  ).size;

  return NextResponse.json({
    categories,
    brands,
    goals,
    allProducts,
    dealsCount,
    settings: {
      announcement_bar: {
        enabled: true,
        text: 'Free Shipping on Orders Above ₹499 | 100% Authentic Products',
      },
    },
  }, {
    headers: { 'Content-Type': 'application/json' },
  });
}
