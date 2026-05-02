import { NextResponse } from 'next/server';
import { CatalogData } from '@/lib/data/json-repository';

const catalog = CatalogData.getInstance();
catalog.loadAll();

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = catalog.products.map(p => {
    const variant = catalog.variants.find(v => v.product_handle === p.handle);
    const image = catalog.images.find(i => i.product_handle === p.handle && i.image_type === 'main');
    return {
      handle: p.handle,
      title: p.title,
      brand_slug: p.brand_slug,
      category: p.category,
      mrp: variant?.mrp || 0,
      salePrice: variant?.sale_price || variant?.mrp || 0,
      mainImage: image?.image_path || '',
      short_description: p.short_description,
    };
  });

  return NextResponse.json(products, {
    headers: { 'Content-Type': 'application/json' },
  });
}
