'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './header';
import { useCart } from './cart-context';

interface CMSData {
  settings: any;
  homepage: any;
  products: any[];
  navigation: any;
}

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  images: { url: string }[];
  badge?: string;
  is_active: boolean;
}

function AnnouncementBar({ text, link, linkText }: { text?: string; link?: string; linkText?: string }) {
  return (
    <div className="announcement-bar">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[1px] md:tracking-[2px] text-center">
          {text || 'FREE SHIPPING ON ORDERS OVER $99 • 30-DAY MONEY BACK GUARANTEE •'}
          {link && linkText && (
            <>
              {' '}
              <Link href={link} className="underline hover:text-gray-300">
                {linkText}
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function QualityBadges({ badges }: { badges?: { icon: string; text: string }[] }) {
  const defaultBadges = [
    { icon: '🧪', text: 'Heavy Metals Tested' },
    { icon: '🎨', text: 'No Artificial Dyes' },
    { icon: '✅', text: '3rd Party Tested' },
    { icon: '💊', text: 'Properly Dosed' },
    { icon: '🏭', text: 'FDA Registered Facility' },
  ];

  return (
    <section className="py-6 md:py-8 bg-gray-50 border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {(badges || defaultBadges).map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-xs md:text-sm text-gray-600 whitespace-nowrap">
              <span className="text-base md:text-lg">{badge.icon}</span>
              <span className="font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTiles({ categories }: { categories?: { title: string; image: string; link: string }[] }) {
  const defaultCategories = [
    { title: 'Health + Wellness', image: '/greenshd-citrus-us-b1d785092f3e.jpg', link: '/collections/health-wellness' },
    { title: 'Pre-Workout', image: '/pumphd-rainbow-strips-ead9f7c7e482.png', link: '/collections/pre-workouts' },
    { title: 'Intra-Workout', image: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png', link: '/collections/intra-workouts' },
    { title: 'Post-Workout', image: '/creahd-53c587c6f495.jpg', link: '/collections/post-workout' },
  ];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-4 gap-1">
          {(categories || defaultCategories).map((cat, i) => (
            <Link key={i} href={cat.link} className="group relative aspect-square overflow-hidden">
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white font-bold text-xs md:text-sm uppercase tracking-[2px] md:tracking-[3px]">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.handle}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img 
            src={product.images?.[0]?.url} 
            alt={product.title} 
            className={`w-full h-full object-cover transition duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          />
          {product.images?.[1]?.url && (
            <img 
              src={product.images[1].url} 
              alt={product.title} 
              className={`absolute inset-0 w-full h-full object-cover transition duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
              {product.badge}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-base font-bold">${Number(product.price).toFixed(2)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button 
          onClick={() => onAddToCart(product)}
          className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-[1.5px] hover:bg-gray-800 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductSection({ title, products, onAddToCart, viewAllLink }: { title: string; products: Product[]; onAddToCart: (p: Product) => void; viewAllLink: string }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[2px] md:tracking-[3px]">{title}</h2>
          <Link href={viewAllLink} className="text-xs font-bold uppercase tracking-[1px] text-gray-500 flex items-center gap-2 hover:text-black">
            View All <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1">
          {products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStory({ data }: { data?: { label?: string; heading?: string; content?: string; quote?: string; image?: string } }) {
  return (
    <section className="grid md:grid-cols-2 min-h-[400px] md:min-h-[500px]">
      <div className="bg-gray-900 relative overflow-hidden min-h-[250px] md:min-h-full">
        <img 
          src={data?.image || "/hdmusclebrand2-1775078638960-180ba2bc3e7b.webp"} 
          alt="HD Muscle Story" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="bg-black text-white flex flex-col justify-center px-8 md:px-12 py-12 md:py-16">
        <span className="text-white text-xs font-bold uppercase tracking-[3px] mb-4">{data?.label || 'Our Mission'}</span>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[2px] md:tracking-[3px] mb-4 md:mb-6">{data?.heading || 'Built By Athletes, For Athletes'}</h2>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
          {data?.content || 'At HD Muscle, we believe in the power of integrity. Every product we create is designed with one goal in mind: to help you reach your full potential.'}
        </p>
        <span className="text-gray-500 text-lg md:text-2xl italic">{data?.quote || '— The HD Muscle Team'}</span>
      </div>
    </section>
  );
}

function Reviews({ title, subtitle, reviews }: { title?: string; subtitle?: string; reviews?: { text: string; author: string; stars: number }[] }) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[2px] md:tracking-[3px] mb-2 md:mb-3">{title || 'Real People, Real Reviews'}</h2>
          <p className="text-gray-500 text-sm md:text-base">{subtitle || 'See what our customers are saying'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {(reviews || []).map((review, i) => (
            <div key={i} className="bg-gray-50 p-6 md:p-8 border border-gray-200">
              <div className="text-black text-sm md:text-base mb-3 md:4">
                {[...Array(review.stars)].map((_, j) => <span key={j} className="mr-0.5">★</span>)}
              </div>
              <p className="text-gray-800 text-sm md:text-base leading-relaxed mb-4 md:mb-5">"{review.text}"</p>
              <p className="font-bold text-sm uppercase tracking-wide">— {review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ title, questions }: { title?: string; questions?: { question: string; answer: string }[] }) {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-[800px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10 uppercase tracking-[2px] md:tracking-[3px]">{title || 'Frequently Asked Questions'}</h2>
        <div className="space-y-0">
          {(questions || []).map((faq, i) => (
            <details key={i} className="group bg-white border border-black">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold list-none text-sm md:text-base">
                {faq.question}
                <span className="text-lg transition group-open:rotate-45">+</span>
              </summary>
              <p className="px-4 pb-4 text-gray-600 text-sm md:text-base">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter({ heading, text, placeholder, button }: { heading?: string; text?: string; placeholder?: string; button?: string }) {
  return (
    <section className="py-12 md:py-16 bg-black text-white">
      <div className="max-w-[600px] mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[2px] md:tracking-[3px] mb-3 md:mb-4">{heading || 'Stay Updated'}</h2>
        <p className="text-gray-400 mb-5 md:mb-6 text-sm md:text-base">{text || 'Subscribe for exclusive offers and new product launches'}</p>
        <form className="flex">
          <input 
            type="email" 
            placeholder={placeholder || 'Enter your email'} 
            className="flex-1 px-4 py-3 bg-black text-white border border-gray-700 focus:outline-none focus:border-white"
          />
          <button className="px-6 md:px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-[1px] hover:bg-gray-200 transition">
            {button || 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer({ settings, navigation }: { settings?: any; navigation?: any }) {
  return (
    <footer className="bg-black text-white py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-lg md:text-xl font-bold uppercase tracking-[2px] md:tracking-[3px] mb-4 md:mb-5">{settings?.store_name || 'HD MUSCLE'}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-5 md:mb-6">
            Premium sports nutrition supplements designed for athletes who demand more.
          </p>
          <div className="flex gap-3">
            <a href={settings?.social_links?.instagram || '#'} className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition text-sm">
              IG
            </a>
            <a href={settings?.social_links?.facebook || '#'} className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition text-sm">
              FB
            </a>
            <a href={settings?.social_links?.youtube || '#'} className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition text-sm">
              YT
            </a>
            <a href={settings?.social_links?.tiktok || '#'} className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition text-sm">
              TT
            </a>
          </div>
        </div>
        {(navigation?.footer_main || []).map((section: any, idx: number) => (
          <div key={idx}>
            <h4 className="text-xs font-bold uppercase tracking-[2px] mb-4 md:mb-5">{section.title}</h4>
            <ul className="space-y-2 md:space-y-3">
              {section.links?.map((link: any, linkIdx: number) => (
                <li key={linkIdx}><Link href={link.link} className="text-gray-400 text-sm hover:text-white transition">{link.title}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-10 md:mt-12 pt-8 border-t border-gray-900 text-center">
        <p className="text-gray-500 text-sm">{settings?.footer?.copyright_text || '© 2024 HD MUSCLE. All rights reserved. Integrity is everything.'}</p>
      </div>
    </footer>
  );
}

function getProductsByHandles(products: any[], handles: string[]): Product[] {
  return handles
    .map(handle => products.find(p => p.handle === handle))
    .filter((p): p is Product => p !== undefined && p.is_active)
    .map(p => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      price: p.price,
      images: p.images,
      badge: p.badge,
      is_active: p.is_active
    }));
}

export default function HomePage() {
  const { addItem } = useCart();
  const [cmsData, setCmsData] = useState<CMSData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/storefront/published')
      .then(res => res.json())
      .then(data => {
        setCmsData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, title: product.title, price: Number(product.price), image: product.images?.[0]?.url });
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-xl">Loading...</div></div>;
  }

  const homepage = cmsData?.homepage;
  const settings = cmsData?.settings;
  const products = cmsData?.products || [];
  const navigation = cmsData?.navigation;

  const bestSellers = getProductsByHandles(products, homepage?.best_sellers?.product_handles || []);
  const newProducts = getProductsByHandles(products, homepage?.new_products?.product_handles || []);
  const apparelProducts = getProductsByHandles(products, homepage?.apparel?.product_handles || []);

  const hero = homepage?.hero || {};
  const qualityBadges = homepage?.quality_badges || {};
  const categoryTiles = homepage?.category_tiles || {};
  const brandStory = homepage?.brand_story || {};
  const testimonials = homepage?.testimonials || {};
  const faq = homepage?.faq || {};
  const guarantee = homepage?.guarantee || {};
  const newsletter = homepage?.newsletter || {};

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar 
        text={settings?.announcement_bar?.text} 
        link={settings?.announcement_bar?.link}
        linkText={settings?.announcement_bar?.link_text}
      />
      <Header />

      <section className="relative h-[70vh] md:h-[600px] bg-gray-900 overflow-hidden">
        <img 
          src={hero.background_image || '/hdmuscle72-1775078686011-5c8049f904ea.webp'} 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
          <div className="max-w-[800px]">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-[4px] md:tracking-[6px] mb-4 md:mb-6">
              {hero.heading || 'Find Your Formula'}
            </h1>
            <p className="text-base md:text-lg text-gray-200 mb-6 md:mb-10 max-w-[450px] md:max-w-[500px] mx-auto">
              {hero.subheading || 'Premium supplements designed for athletes who demand more. Scientifically formulated to help you reach your peak performance.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href={hero.cta_primary?.link || '#products'} className="px-8 md:px-10 py-3 md:py-4 bg-white text-black text-xs md:text-sm font-bold uppercase tracking-[2px] hover:bg-gray-200 transition">
                {hero.cta_primary?.text || 'Shop Now'}
              </Link>
              <Link href={hero.cta_secondary?.link || '#about'} className="px-8 md:px-10 py-3 md:py-4 border-2 border-white text-white text-xs md:text-sm font-bold uppercase tracking-[2px] hover:bg-white hover:text-black transition">
                {hero.cta_secondary?.text || 'Learn More'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <QualityBadges badges={qualityBadges.badges} />

      <CategoryTiles categories={categoryTiles.categories} />

      <div id="products">
        <ProductSection 
          title={homepage?.best_sellers?.title || "Shop Our Best Sellers"} 
          products={bestSellers} 
          onAddToCart={handleAddToCart}
          viewAllLink={homepage?.best_sellers?.link || '/collections/best-selling-collection'}
        />
      </div>

      <ProductSection 
        title={homepage?.new_products?.title || "New + Noteworthy"} 
        products={newProducts} 
        onAddToCart={handleAddToCart}
        viewAllLink={homepage?.new_products?.link || '/collections/new-featured'}
      />

      <div id="about">
        <BrandStory data={brandStory} />
      </div>

      <Reviews 
        title={testimonials.title} 
        subtitle={testimonials.subtitle} 
        reviews={testimonials.reviews} 
      />

      <ProductSection 
        title={homepage?.apparel?.title || "New Arrivals — Apparel + Accessories"} 
        products={apparelProducts} 
        onAddToCart={handleAddToCart}
        viewAllLink={homepage?.apparel?.link || '/collections/apparel'}
      />

      <FAQSection title={faq.title} questions={faq.questions} />

      <section className="py-14 md:py-16 bg-black text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[2px] md:tracking-[3px] mb-4">{guarantee.heading || "You're Covered"}</h2>
          <p className="text-gray-300 mb-6 md:mb-8">{guarantee.text || '30-Day Money Back Guarantee on all orders'}</p>
          <Link href={guarantee.link || '/pages/shipping-policy'} className="text-white font-semibold hover:underline">
            Learn More →
          </Link>
        </div>
      </section>

      <Newsletter 
        heading={newsletter.heading}
        text={newsletter.text}
        placeholder={newsletter.placeholder}
        button={newsletter.button}
      />
      <Footer settings={settings} navigation={navigation} />
    </div>
  );
}
