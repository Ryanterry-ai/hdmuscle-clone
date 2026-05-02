'use server';

import { catalogService } from '@/lib/data/json-repository';
import type { ProductDetail } from '@/lib/data/types';

export async function getProductDetailAction(handle: string): Promise<ProductDetail | null> {
  return catalogService.getProductDetail(handle);
}
