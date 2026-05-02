export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Flame, BadgePercent, TrendingDown } from 'lucide-react';
import { CatalogData } from '@/lib/data/json-repository';
import ProductCard from '@/components/ProductCard';
import Breadcrumb from '@/components/Breadcrumb';

export default async function DealsPage() {
  const catalog = CatalogData.getInstance();
  catalog.loadAll();

  const deals = catalog.getDeals();
  const sortedDeals = [...deals].sort((a, b) => b.discount_percent - a.discount_percent);

  function getProductCardProps(deal: any) {
    const detail = deal.product;
    const variants = detail.variants;
    const images = detail.images;
    const mainImage = images.find((i: any) => i.image_type === 'main')?.image_path || images[0]?.image_path || '';
    const mrp = Math.min(...variants.map((v: any) => v.mrp));
    const salePrice = Math.min(...variants.map((v: any) => v.sale_price));
    const discount = deal.discount_percent;
    const saveAmount = mrp - salePrice;
    const brand = catalog.brands.find(b => b.slug === detail.product.brand_slug);
    const badges = [`${discount}% OFF`];

    return {
      handle: detail.product.handle,
      title: detail.product.title,
      brandName: brand?.name || detail.product.brand_slug,
      mrp,
      salePrice,
      mainImage,
      discountPercent: discount,
      badges,
    };
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Hot Deals', href: '/deals' },
          ]} />
          <div className="flex items-center gap-4 mt-2">
            <Flame className="w-10 h-10 text-yellow-300 animate-pulse" />
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Hot Deals</h1>
              <p className="text-white/80 mt-2 text-lg">Limited time offers - Save big on top products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <p className="text-sm text-text-muted">
            Showing <span className="font-semibold text-gray-900">{sortedDeals.length}</span> deals - Sorted by highest discount
          </p>
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <TrendingDown className="w-4 h-4" />
            <span className="font-semibold">Highest Discount First</span>
          </div>
        </div>

        {sortedDeals.length === 0 ? (
          <div className="text-center py-16">
            <BadgePercent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-text-muted text-lg">No deals available at the moment.</p>
            <p className="text-text-muted text-sm mt-2">Check back soon for exciting offers!</p>
            <Link href="/shop" className="btn-filled mt-6 inline-block">Browse All Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedDeals.map((deal, index) => {
              const props = getProductCardProps(deal);
              const mrp = Math.min(...deal.product.variants.map((v: any) => v.mrp));
              const salePrice = Math.min(...deal.product.variants.map((v: any) => v.sale_price));
              const saveAmount = mrp - salePrice;
              return (
                <div key={deal.product.product.handle} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      TOP DEAL
                    </div>
                  )}
                  <div className="relative">
                    <ProductCard {...props} />
                    <div className="absolute bottom-4 left-4 right-4 bg-red-50 border-2 border-red-200 rounded-lg p-2 text-center">
                      <p className="text-red-600 font-bold text-sm">
                        Save ₹{saveAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


