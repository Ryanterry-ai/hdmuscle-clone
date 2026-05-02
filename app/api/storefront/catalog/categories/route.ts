import { NextResponse } from 'next/server';
import { CatalogData } from '@/lib/data/json-repository';

const catalog = CatalogData.getInstance();
catalog.loadAll();

export const dynamic = 'force-dynamic';

export async function GET() {
  const uniqueCategories = [...new Set(catalog.categories.map(c => c.name))].map(name => {
    const cat = catalog.categories.find(c => c.name === name);
    return {
      name,
      slug: cat?.slug || '',
      productCount: catalog.products.filter(p => p.category === name).length,
    };
  });

  return NextResponse.json(uniqueCategories, {
    headers: { 'Content-Type': 'application/json' },
  });
}
