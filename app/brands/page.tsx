export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CatalogData } from '@/lib/data/json-repository';
import BrandCard from '@/components/BrandCard';
import Breadcrumb from '@/components/Breadcrumb';

interface BrandWithCount {
  name: string;
  slug: string;
  description: string;
  logo: string;
  productCount: number;
}

export default async function BrandsPage() {
  const catalog = CatalogData.getInstance();
  catalog.loadAll();

  const brandsWithProducts: BrandWithCount[] = catalog.brands
    .filter(b => b.is_active)
    .map(brand => {
      const productCount = catalog.products.filter(p => p.brand_slug === brand.slug).length;
      return {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        logo: brand.logo,
        productCount,
      };
    })
    .filter(b => b.productCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dark-bg text-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Brands', href: '/brands' },
          ]} />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">Shop by Brand</h1>
          <p className="text-text-light mt-3 max-w-2xl">
            Discover authentic supplements from the world's leading nutrition and wellness brands
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <p className="text-sm text-text-muted">
            Showing <span className="font-semibold text-gray-900">{brandsWithProducts.length}</span> brands
          </p>
        </div>

        {brandsWithProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">No brands found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {brandsWithProducts.map((brand) => (
              <BrandCard
                key={brand.slug}
                name={brand.name}
                slug={brand.slug}
                description={brand.description}
                productCount={brand.productCount}
                logo={brand.logo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


