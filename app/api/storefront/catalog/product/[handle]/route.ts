import { NextResponse } from 'next/server';
import { CatalogData } from '@/lib/data/json-repository';

const catalog = CatalogData.getInstance();
catalog.loadAll();

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  const handle = params.handle;
  const detail = catalog.getProductDetail(handle);

  if (!detail) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(detail, {
    headers: { 'Content-Type': 'application/json' },
  });
}
