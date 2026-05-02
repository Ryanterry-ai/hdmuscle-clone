export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Suspense } from 'react';
import { CatalogData } from '@/lib/data/json-repository';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';
import Breadcrumb from '@/components/Breadcrumb';
import SortSelect from '@/components/SortSelect';

interface ShopPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    goal?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const catalog = CatalogData.getInstance();
  catalog.loadAll();

  const allProducts = catalog.products.map(p => catalog.getProductDetail(p.handle)).filter(Boolean);

  const categories = [...new Set(catalog.categories.map(c => c.name))].map(c => ({ label: c, value: c }));
  const brands = catalog.brands.map(b => ({ label: b.name, value: b.slug }));
  const goals = [...new Set(catalog.categories.map(c => c.goal))].filter(Boolean).map(g => ({ label: g, value: g }));
  const priceRange = { min: 0, max: Math.max(...allProducts.flatMap(p => p!.variants.map(v => v.mrp))) };

  let filtered = [...allProducts];

  if (searchParams.category) {
    filtered = filtered.filter(p => p!.product.category === searchParams.category);
  }
  if (searchParams.brand) {
    filtered = filtered.filter(p => p!.product.brand_slug === searchParams.brand);
  }
  if (searchParams.goal) {
    const goalCategories = catalog.categories.filter(c => c.goal === searchParams.goal).map(c => c.name);
    filtered = filtered.filter(p => goalCategories.includes(p!.product.category));
  }
  if (searchParams.minPrice) {
    const min = Number(searchParams.minPrice);
    filtered = filtered.filter(p => Math.min(...p!.variants.map(v => v.sale_price)) >= min);
  }
  if (searchParams.maxPrice) {
    const max = Number(searchParams.maxPrice);
    filtered = filtered.filter(p => Math.min(...p!.variants.map(v => v.sale_price)) <= max);
  }
  if (searchParams.inStock === 'true') {
    filtered = filtered.filter(p => p!.inventories.some(i => i.stock > 0));
  }

  const sort = searchParams.sort || 'newest';
  switch (sort) {
    case 'price-low':
      filtered.sort((a, b) => Math.min(...a!.variants.map(v => v.sale_price)) - Math.min(...b!.variants.map(v => v.sale_price)));
      break;
    case 'price-high':
      filtered.sort((a, b) => Math.min(...b!.variants.map(v => v.sale_price)) - Math.min(...a!.variants.map(v => v.sale_price)));
      break;
    case 'name':
      filtered.sort((a, b) => a!.product.title.localeCompare(b!.product.title));
      break;
    default:
      filtered.sort((a, b) => +new Date(b!.product.created_at) - +new Date(a!.product.created_at));
  }

  const page = Number(searchParams.page) || 1;
  const perPage = 12;
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function getProductCardProps(detail: any) {
    const variants = detail.variants;
    const images = detail.images;
    const mainImage = images.find((i: any) => i.image_type === 'main')?.image_path || images[0]?.image_path || '';
    const mrp = Math.min(...variants.map((v: any) => v.mrp));
    const salePrice = Math.min(...variants.map((v: any) => v.sale_price));
    const discount = mrp > salePrice ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;
    const brand = catalog.brands.find(b => b.slug === detail.product.brand_slug);
    const isNew = +new Date(detail.product.created_at) > +new Date() - 30 * 24 * 60 * 60 * 1000;
    const badges = isNew ? ['new'] : [];

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
    <div className="min-h-screen bg-light-bg">
      <div className="bg-dark-bg text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
          ]} />
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">Shop All Products</h1>
          <p className="text-text-light mt-2">Discover premium supplements and nutrition products</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-text-muted">
            Showing <span className="font-semibold text-gray-900">{paginated.length}</span> of <span className="font-semibold text-gray-900">{total}</span> products
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-text-muted hidden sm:inline">Sort:</label>
            <SortSelect defaultValue={sort} />
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-border-light p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
              <ProductFilter
                categories={categories}
                brands={brands}
                goals={goals}
                priceRange={priceRange}
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="lg:hidden mb-4">
              <ProductFilter
                categories={categories}
                brands={brands}
                goals={goals}
                priceRange={priceRange}
              />
            </div>

            {paginated.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-muted text-lg">No products found matching your filters.</p>
                <Link href="/shop" className="btn-ghost mt-4 inline-block">Clear Filters</Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {paginated.map((detail) => (
                    <ProductCard key={detail!.product.handle} {...getProductCardProps(detail!)} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8 sm:mt-12">
                    {page > 1 && (
                      <Link
                        href={`/shop?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}
                        className="btn-ghost px-4 py-2"
                      >
                        Previous
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/shop?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                          p === page
                            ? 'bg-primary text-dark-bg'
                            : 'bg-white text-gray-900 hover:bg-light-bg'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                    {page < totalPages && (
                      <Link
                        href={`/shop?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}
                        className="btn-ghost px-4 py-2"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


