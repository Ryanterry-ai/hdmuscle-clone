import { notFound } from 'next/navigation';
import { catalogService, brandRepository, productRepository } from '@/lib/data/json-repository';
import type { ProductDetail, Brand } from '@/lib/data/types';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: { handle: string };
}

export async function generateMetadata({ params }: Props) {
  const productDetail = await catalogService.getProductDetail(params.handle);
  if (!productDetail) return {};
  return {
    title: productDetail.seo.seo_title || productDetail.product.title,
    description: productDetail.seo.seo_description || productDetail.product.short_description,
  };
}

export default async function ProductPage({ params }: Props) {
  const handle = params.handle;
  const productDetail = await catalogService.getProductDetail(handle);
  if (!productDetail) notFound();

  const brand = await brandRepository.getBySlug(productDetail.product.brand_slug);

  const allProducts = await productRepository.getAll();
  
  const relatedProductDetails = await Promise.all(
    allProducts
      .filter(p => p.category === productDetail.product.category && p.handle !== handle)
      .slice(0, 4)
      .map(p => catalogService.getProductDetail(p.handle))
  );
  const relatedProducts = relatedProductDetails.filter((p): p is ProductDetail => p !== null);

  const similarProductDetails = await Promise.all(
    allProducts
      .filter(p => 
        p.product_type === productDetail.product.product_type && 
        p.brand_slug !== productDetail.product.brand_slug && 
        p.handle !== handle
      )
      .slice(0, 4)
      .map(p => catalogService.getProductDetail(p.handle))
  );
  const similarProducts = similarProductDetails.filter((p): p is ProductDetail => p !== null);

  return (
    <ProductDetailClient
      productDetail={productDetail}
      brand={brand}
      relatedProducts={relatedProducts}
      similarProducts={similarProducts}
    />
  );
}
