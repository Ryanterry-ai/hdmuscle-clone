import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Target, Flame, Shield, Zap, Heart, Activity, Dumbbell } from 'lucide-react';
import { CatalogData } from '@/lib/data/json-repository';
import ProductCard from '@/components/ProductCard';
import Breadcrumb from '@/components/Breadcrumb';

interface GoalPageProps {
  params: { slug: string };
}

const goalIcons: Record<string, any> = {
  'muscle-building': Dumbbell,
  'weight-loss': Flame,
  'immunity': Shield,
  'recovery': Heart,
  'general-health': Activity,
  'energy': Zap,
  'default': Target,
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default async function GoalPage({ params }: GoalPageProps) {
  const catalog = CatalogData.getInstance();
  catalog.loadAll();

  const goals = catalog.getGoalsWithProducts();
  const goal = goals.find(g => slugify(g.goal) === params.slug);

  if (!goal) {
    notFound();
  }

  const IconComponent = goalIcons[params.slug] || goalIcons['default'];

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
            { label: 'Goals', href: '/shop' },
            { label: goal.goal, href: `/goals/${params.slug}` },
          ]} />
          <div className="flex items-center gap-4 mt-2">
            <IconComponent className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{goal.goal}</h1>
          </div>
          {goal.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {goal.categories.map((cat, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <p className="text-sm text-text-muted">
            Showing <span className="font-semibold text-gray-900">{goal.products.length}</span> products
          </p>
        </div>

        {goal.products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">No products found for this goal.</p>
            <Link href="/shop" className="btn-ghost mt-4 inline-block">Browse All Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {goal.products.map((detail) => (
              <ProductCard key={detail.product.handle} {...getProductCardProps(detail)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

