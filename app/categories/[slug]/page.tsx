import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatalogData } from '@/lib/data/json-repository';
import ProductCard from '@/components/ProductCard';
import Breadcrumb from '@/components/Breadcrumb';

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const catalog = CatalogData.getInstance();
  catalog.loadAll();

  const category = catalog.categories.find(c => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const products = catalog.products
    .filter(p => p.category === category.name)
    .map(p => catalog.getProductDetail(p.handle))
    .filter(Boolean);

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
      <div className="bg-dark-bg text-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: category.name, href: `/categories/${category.slug}` },
          ]} />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">{category.name}</h1>
          <div className="flex flex-wrap gap-3 mt-4">
            {category.subcategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm">
                {category.subcategory}
              </span>
            )}
            {category.goal && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                {category.goal}
              </span>
            )}
            {category.menu_group && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm">
                {category.menu_group}
              </span>
            )}
          </div>
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
            <p className="text-text-muted text-lg">No products found in this category.</p>
            <Link href="/shop" className="btn-ghost mt-4 inline-block">Browse All Products</Link>
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

