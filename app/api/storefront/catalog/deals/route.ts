import { NextResponse } from 'next/server';
import { CatalogData } from '@/lib/data/json-repository';

const catalog = CatalogData.getInstance();
catalog.loadAll();

export const dynamic = 'force-dynamic';

export async function GET() {
  const seenHandles = new Set<string>();
  const deals: any[] = [];

  catalog.products.forEach(p => {
    if (seenHandles.has(p.handle)) return;
    const variants = catalog.variants.filter(v => v.product_handle === p.handle);
    const dealVariant = variants.find(v => v.sale_price < v.mrp);
    if (dealVariant) {
      const discount = Math.round(((dealVariant.mrp - dealVariant.sale_price) / dealVariant.mrp) * 100);
      const image = catalog.images.find(i => i.product_handle === p.handle && i.image_type === 'main');
      deals.push({
        handle: p.handle,
        title: p.title,
        brand_slug: p.brand_slug,
        mrp: dealVariant.mrp,
        salePrice: dealVariant.sale_price,
        discountPercent: discount,
        mainImage: image?.image_path || '',
      });
      seenHandles.add(p.handle);
    }
  });

  return NextResponse.json(deals, {
    headers: { 'Content-Type': 'application/json' },
  });
}
