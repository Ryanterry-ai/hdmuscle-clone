import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatalogData } from '@/lib/data/json-repository';
import ProductCard from '@/components/ProductCard';
import Breadcrumb from '@/components/Breadcrumb';

interface BrandPageProps {
  params: { slug: string };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const catalog = CatalogData.getInstance();
  catalog.loadAll();

  const brand = catalog.brands.find(b => b.slug === params.slug);

  if (!brand) {
    notFound();
  }

  const products = catalog.products
    .filter(p => p.brand_slug === params.slug)
    .map(p => catalog.getProductDetail(p.handle))
    .filter(Boolean);

  function getProductCardProps(detail: any) {
    const variants = detail.variants;
    const images = detail.images;
    const mainImage = images.find((i: any) => i.image_type === 'main')?.image_path || images[0]?.image_path || '';
    const mrp = Math.min(...variants.map((v: any) => v.mrp));
    const salePrice = Math.min(...variants.map((v: any) => v.sale_price));
    const discount = mrp > salePrice ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;
    const isNew = +new Date(detail.product.created_at) > +new Date() - 30 * 24 * 60 * 60 * 1000;
    const badges = isNew ? ['new'] : [];

    return {
      handle: detail.product.handle,
      title: detail.product.title,
      brandName: brand!.name,
      mrp,
      salePrice,
      mainImage,
      discountPercent: discount,
      badges,
    };
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <div className="bg-dark-bg text-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Brands', href: '/brands' },
            { label: brand.name, href: `/brands/${brand.slug}` },
          ]} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-4">
            {brand.logo && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{brand.name}</h1>
              {brand.country_of_origin && (
                <p className="text-text-light mt-2">From {brand.country_of_origin}</p>
              )}
            </div>
          </div>
          {brand.description && (
            <p className="text-text-light mt-4 max-w-3xl leading-relaxed">{brand.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <p className="text-sm text-text-muted">
            Showing <span className="font-semibold text-gray-900">{products.length}</span> products
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">No products found for this brand.</p>
            <Link href="/brands" className="btn-ghost mt-4 inline-block">View All Brands</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((detail) => (
              <ProductCard key={detail!.product.handle} {...getProductCardProps(detail!)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

