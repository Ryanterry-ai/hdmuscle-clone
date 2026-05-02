export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CatalogData } from '@/lib/data/json-repository';
import ProductCard from './components/ProductCard';
import BrandCard from './components/BrandCard';
import CategoryTile from './components/CategoryTile';
import TrustBadges from './components/TrustBadges';

const catalog = CatalogData.getInstance();
catalog.loadAll();

function getBrandName(slug: string): string {
  return catalog.brands.find(b => b.slug === slug)?.name || slug;
}

function getMainImage(handle: string): string {
  return catalog.images.find(i => i.product_handle === handle && i.image_type === 'main')?.image_path || '';
}

function getFirstVariant(handle: string) {
  return catalog.variants.find(v => v.product_handle === handle);
}

export default function HomePage() {
  const categories = [...new Set(catalog.categories.map(c => c.name))].map(name => {
    const cat = catalog.categories.find(c => c.name === name);
    return {
      name,
      slug: cat?.slug || '',
      productCount: catalog.products.filter(p => p.category === name).length,
    };
  });

  const brands = catalog.brands.map(brand => ({
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logo: brand.logo,
    productCount: catalog.products.filter(p => p.brand_slug === brand.slug).length,
  }));

  const featuredProducts = catalog.products.slice(0, 8).map(p => {
    const variant = getFirstVariant(p.handle);
    const discount = variant && variant.sale_price < variant.mrp
      ? Math.round(((variant.mrp - variant.sale_price) / variant.mrp) * 100)
      : 0;
    return {
      handle: p.handle,
      title: p.title,
      brandName: getBrandName(p.brand_slug),
      mrp: variant?.mrp || 0,
      salePrice: variant?.sale_price || variant?.mrp || 0,
      mainImage: getMainImage(p.handle),
      discountPercent: discount,
    };
  });

  const deals = (() => {
    const seen = new Set<string>();
    const result: any[] = [];
    catalog.products.forEach(p => {
      if (seen.has(p.handle)) return;
      const variant = getFirstVariant(p.handle);
      if (variant && variant.sale_price < variant.mrp) {
        result.push({
          handle: p.handle,
          title: p.title,
          brandName: getBrandName(p.brand_slug),
          mrp: variant.mrp,
          salePrice: variant.sale_price,
          discountPercent: Math.round(((variant.mrp - variant.sale_price) / variant.mrp) * 100),
          mainImage: getMainImage(p.handle),
        });
        seen.add(p.handle);
      }
    });
    return result.slice(0, 4);
  })();

  const goalMap: Record<string, string> = {};
  catalog.products.forEach(p => {
    const cat = catalog.categories.find(c => c.name === p.category);
    goalMap[p.handle] = cat?.goal || 'uncategorized';
  });

  const goals = [...new Set(Object.values(goalMap))].map(goal => ({
    goal,
    productCount: catalog.products.filter(p => goalMap[p.handle] === goal).length,
  }));

  return (
    <div className="min-h-screen">
      <section className="relative h-[70vh] md:h-[600px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] opacity-90" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-[4px] md:tracking-[6px] mb-4 md:mb-6">
            All Your Favorite{' '}
            <span className="text-[#00ff88]">Supplement Brands</span>.
            <br />
            One Trusted Store.
          </h1>
          <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Premium supplements, lab-tested quality, and authentic products from the world's top fitness brands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-10 py-4 bg-[#00ff88] text-black text-sm font-bold uppercase tracking-[2px] hover:bg-[#00ff88]/90 transition"
            >
              Shop Now
            </Link>
            <Link
              href="/deals"
              className="px-10 py-4 border-2 border-[#00ff88] text-[#00ff88] text-sm font-bold uppercase tracking-[2px] hover:bg-[#00ff88] hover:text-black transition"
            >
              View Deals
            </Link>
          </div>
        </div>
      </section>

      <TrustBadges />

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px] text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Find exactly what you need from our wide range of supplement categories.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <CategoryTile key={cat.slug} name={cat.name} slug={cat.slug} productCount={cat.productCount} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#f8f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px] text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-text-muted">Handpicked favorites from top brands</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#00ff88] uppercase tracking-[1px] hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.handle} {...product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px] text-gray-900 mb-4">
              Shop by Brand
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Choose from the world's most trusted supplement brands.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {brands.map(brand => (
              <BrandCard key={brand.slug} {...brand} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#0a0a0f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#00ff88] text-sm font-bold uppercase tracking-[3px]">Authenticity Guarantee</span>
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px] mt-4 mb-6">
                Batch-Level Verification
              </h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Every product on Upgraded.co.in undergoes rigorous authentication. We verify at the batch level — not just the brand level — ensuring that every tub, bottle, and packet you receive is 100% authentic.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Direct-from-brand or authorized distributor sourcing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Batch-level invoice matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>Lab testing certificates available on request</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#00ff88] mt-1">✓</span>
                  <span>FSSAI-compliant storage and handling</span>
                </li>
              </ul>
            </div>
            <div className="bg-[#111118] rounded-2xl p-8 border border-gray-800">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-[2px] mb-2">100% Authenticity</h3>
                <p className="text-gray-400 text-sm">Or your money back. No questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#f8f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px] text-gray-900 mb-4">
              Shop by Goal
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Find products tailored to your fitness goals.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {goals.map(g => (
              <Link
                key={g.goal}
                href={`/goal/${g.goal.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-white rounded-xl border border-border-light p-6 text-center transition-all duration-300 hover:border-[#00ff88] hover:shadow-glow-green-sm"
              >
                <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#00ff88] transition-colors uppercase tracking-wide mb-2">
                  {g.goal}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted">
                  {g.productCount} {g.productCount === 1 ? 'product' : 'products'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {deals.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px] text-gray-900 mb-2">
                  Deals & Offers
                </h2>
                <p className="text-text-muted">Limited-time discounts on top products</p>
              </div>
              <Link href="/deals" className="text-sm font-semibold text-[#00ff88] uppercase tracking-[1px] hover:underline">
                All Deals →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals.map(product => (
                <ProductCard key={product.handle} {...product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-20 bg-[#111118] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px] mb-4">
            Wholesale & Distribution
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Are you a gym owner, retailer, or distributor looking for authentic supplements at competitive prices? Partner with Upgraded.co.in today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wholesale"
              className="px-10 py-4 bg-[#00ff88] text-black text-sm font-bold uppercase tracking-[2px] hover:bg-[#00ff88]/90 transition"
            >
              Wholesale Inquiry
            </Link>
            <Link
              href="/distributor"
              className="px-10 py-4 border-2 border-[#00ff88] text-[#00ff88] text-sm font-bold uppercase tracking-[2px] hover:bg-[#00ff88] hover:text-black transition"
            >
              Become a Distributor
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#f8f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[3px] text-gray-900 mb-4">
              Fitness Content Hub
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Expert tips, workout plans, and nutrition advice to help you reach your goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Pre-Workout Nutrition: What to Eat Before Training', date: 'Coming Soon' },
              { title: 'Protein Timing: Maximize Muscle Growth', date: 'Coming Soon' },
              { title: 'Supplement Guide for Beginners', date: 'Coming Soon' },
            ].map((post, i) => (
              <div key={i} className="bg-white rounded-xl border border-border-light p-6 transition-all duration-300 hover:shadow-lg">
                <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-text-muted text-sm">Blog Image</span>
                </div>
                <p className="text-xs text-[#00ff88] font-semibold uppercase tracking-wide mb-2">{post.date}</p>
                <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <Link href="/blog" className="text-sm font-semibold text-[#00ff88] uppercase tracking-[1px] hover:underline">
                  Read More →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/blog" className="text-sm font-semibold text-[#00ff88] uppercase tracking-[1px] hover:underline">
              Visit Content Hub →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


