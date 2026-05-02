import { NextResponse } from 'next/server';
import { CatalogData } from '@/lib/data/json-repository';

const catalog = CatalogData.getInstance();
catalog.loadAll();

export const dynamic = 'force-dynamic';

export async function GET() {
  const brands = catalog.brands.map(brand => ({
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    description: brand.description,
    productCount: catalog.products.filter(p => p.brand_slug === brand.slug).length,
  }));

  return NextResponse.json(brands, {
    headers: { 'Content-Type': 'application/json' },
  });
}
