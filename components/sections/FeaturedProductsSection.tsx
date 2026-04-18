'use client';

import { CMSSection, CMSSectionContent, CMSProduct } from '@/lib/cms';
import { SectionWrapper, SectionTitle } from './SectionWrapper';

interface FeaturedProductsSectionProps {
  section: CMSSection;
}

function ProductCard({ product }: { product: CMSProduct }) {
  const hasDiscount = product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_at_price!)) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.featured_image ? (
          <img
            src={product.featured_image.src}
            alt={product.featured_image.alt || product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{parseFloat(product.price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              ₹{parseFloat(product.compare_at_price!).toLocaleString()}
            </span>
          )}
        </div>
        <button className="w-full mt-3 bg-gray-900 text-white py-2 px-4 rounded text-sm font-medium hover:bg-red-600 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export function FeaturedProductsSection({ section }: FeaturedProductsSectionProps) {
  const content = section.content as CMSSectionContent;
  const products = content.products || [];

  return (
    <SectionWrapper section={section} className="bg-white">
      <SectionTitle title={content.title} subtitle={content.subtitle} />
      {products.length > 0 ? (
        <div className={`grid gap-6 ${
          products.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : products.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
              : products.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {products.slice(0, content.max_products || 8).map((product: CMSProduct) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No products available at the moment
        </div>
      )}
      {content.cta_text && content.cta_link && (
        <div className="text-center mt-10">
          <a
            href={content.cta_link}
            className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors"
          >
            {content.cta_text}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      )}
    </SectionWrapper>
  );
}

export default FeaturedProductsSection;
