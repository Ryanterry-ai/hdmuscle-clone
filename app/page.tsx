'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from './header';
import { useCart } from './cart-context';
import { getSettings, getProducts, getCollections, getHeroSection, formatCurrency } from './lib/cms';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  images: { url: string }[];
  is_active: boolean;
}

function ProductCarousel({ title, products, settings, onAddToCart, viewAllLink }: { title: string; products: Product[]; settings: any; onAddToCart: (p: Product) => void; viewAllLink: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 100);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <div className="flex items-center gap-4">
            <Link href={viewAllLink} className="text-sm font-medium text-red-600 hover:underline">
              View all products →
            </Link>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-10 h-10 border rounded-full flex items-center justify-center transition ${canScrollLeft ? 'hover:bg-gray-100' : 'opacity-30 cursor-not-allowed'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-10 h-10 border rounded-full flex items-center justify-center transition ${canScrollRight ? 'hover:bg-gray-100' : 'opacity-30 cursor-not-allowed'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={checkScroll}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} settings={settings} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, settings, onAddToCart }: { product: Product; settings: any; onAddToCart: (p: Product) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div 
      className="flex-shrink-0 w-[280px] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.handle}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden mb-3">
          {product.images?.[0]?.url ? (
            <img 
              src={hasMultipleImages && isHovered && product.images[1]?.url ? product.images[1].url : product.images[0].url} 
              alt={product.title} 
              className="w-full h-full object-cover transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">💪</div>
          )}
          <div className={`absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
        </div>
        <h3 className="font-semibold mb-1 group-hover:text-red-600 transition">{product.title}</h3>
        <p className="text-red-600 font-bold">{formatCurrency(Number(product.price), settings.currency, settings.locale)}</p>
      </Link>
      <button 
        onClick={() => onAddToCart(product)}
        className="w-full mt-3 py-3 bg-black text-white font-medium rounded hover:bg-red-600 transition"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default function HomePage() {
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => { if (mounted) setLoading(false); }, 10000);
    
    fetch('https://cms.hdmuscle.in/api/storefront/published')
      .then(res => res.json())
      .then(data => {
        if (mounted) { setPayload(data); setLoading(false); }
      })
      .catch(() => { if (mounted) setLoading(false); });
    
    return () => { mounted = false; clearTimeout(timer); };
  }, []);

  const settings = getSettings(payload);
  const products = getProducts(payload).filter((p: Product) => p.is_active !== false);
  const collections = getCollections(payload);
  const hero = getHeroSection(payload);

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, title: product.title, price: Number(product.price), image: product.images?.[0]?.url });
  };

  const bestSellers = products.slice(0, 8);
  const newProducts = products.slice(8, 16);
  const apparelProducts = products.slice(16, 24);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading HD Muscle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="relative bg-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{hero?.heading || 'FIND YOUR FORMULA'}</h1>
          <p className="text-xl text-gray-300 mb-8">{hero?.subheading || 'Premium Quality Supplements for Athletes'}</p>
          <Link href="/collections/best-selling-collection" className="inline-block px-8 py-3 bg-red-600 font-semibold rounded-lg hover:bg-red-700">
            Shop All — Supplements
          </Link>
        </div>
      </section>

      <section className="py-8 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 overflow-x-auto">
          {['GMP Certified', 'Free Shipping $50+', '30-Day Returns', 'Expert Support'].map((text, i) => (
            <div key={i} className="flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {collections.slice(0, 8).map((col: any) => (
              <Link key={col.id} href={`/collections/${col.handle}`} className="group">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {col.image ? <img src={col.image} alt={col.title} className="w-full h-full object-cover group-hover:scale-105 transition" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                </div>
                <p className="mt-3 font-semibold text-center">{col.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductCarousel 
        title="SHOP OUR BEST SELLERS" 
        products={bestSellers} 
        settings={settings} 
        onAddToCart={handleAddToCart}
        viewAllLink="/collections/best-selling-collection"
      />

      <ProductCarousel 
        title="NEW AND NOTEWORTHY ↓" 
        products={newProducts} 
        settings={settings} 
        onAddToCart={handleAddToCart}
        viewAllLink="/collections/new-featured"
      />

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-4">HD Muscle is a family-built company.</h2>
            <p className="text-gray-600 mb-4">
              Founded by fitness enthusiasts who demanded more from their supplements, HD Muscle creates products that actually work. 
              Every formula is rigorously tested and backed by science to help you reach your fitness goals.
            </p>
            <p className="text-gray-600 mb-6">
              We're not just another supplement brand. We're a community of athletes, lifters, and fitness warriors committed to excellence.
            </p>
            <Link href="/pages/our-story" className="text-red-600 font-medium hover:underline">
              Learn More About Us →
            </Link>
          </div>
          <div className="order-1 md:order-2 bg-gray-200 rounded-xl overflow-hidden aspect-video">
            <img 
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800" 
              alt="HD Muscle Story" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">REAL PEOPLE, REAL REVIEWS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-600 mb-4">"Best pre-workout I've ever used. The energy is clean and focused."</p>
              <p className="font-semibold">- John D.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-600 mb-4">"Amazing quality supplements. Been using HD Muscle for years!"</p>
              <p className="font-semibold">- Mike R.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex text-yellow-400 mb-3">★★★★★</div>
              <p className="text-gray-600 mb-4">"The best value for money. Real results I've seen."</p>
              <p className="font-semibold">- Sarah K.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-gray-900 text-white py-32 overflow-hidden">
        <video 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="https://videos.pexels.com/video-files/4761437/4761437-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">TRAIN LIKE A PRO</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of athletes who trust HD Muscle</p>
          <Link href="/collections/best-selling-collection" className="inline-block px-8 py-3 bg-red-600 font-semibold rounded-lg hover:bg-red-700">
            Shop Now
          </Link>
        </div>
      </section>

      <ProductCarousel 
        title="NEW ARRIVALS — APPAREL + ACCESSORIES" 
        products={apparelProducts} 
        settings={settings} 
        onAddToCart={handleAddToCart}
        viewAllLink="/collections/new-25"
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">FREQUENTLY ASKED QUESTIONS</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { q: "How long does shipping take?", a: "Free shipping on orders over $50. Standard shipping takes 3-5 business days." },
              { q: "What's your return policy?", a: "We offer a 30-day money-back guarantee on all products." },
              { q: "Are your products GMP certified?", a: "Yes, all our products are manufactured in GMP certified facilities." },
              { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide." }
            ].map((faq, i) => (
              <details key={i} className="group bg-gray-50 rounded-lg">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-medium">
                  {faq.q}
                  <svg className="w-5 h-5 transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">YOU'RE COVERED</h2>
          <p className="text-gray-300 mb-8">30-Day Money Back Guarantee on all orders</p>
          <Link href="/pages/shipping-policy" className="text-red-600 font-medium hover:underline">
            Learn More →
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8">Subscribe for exclusive offers</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900" />
            <button className="px-6 py-3 bg-red-600 font-semibold rounded-lg hover:bg-red-700">Subscribe</button>
          </form>
        </div>
      </section>

      <footer className="bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div><h3 className="text-white font-semibold mb-4">Shop</h3><div className="space-y-2"><Link href="/collections/pre-workouts" className="block hover:text-white">Pre-Workout</Link><Link href="/collections/intra-workouts" className="block hover:text-white">Recovery</Link><Link href="/collections/bundles" className="block hover:text-white">Bundles</Link></div></div>
          <div><h3 className="text-white font-semibold mb-4">Support</h3><div className="space-y-2"><Link href="/pages/faq" className="block hover:text-white">FAQ</Link><Link href="/pages/contact" className="block hover:text-white">Contact</Link><Link href="/pages/shipping-policy" className="block hover:text-white">Shipping</Link></div></div>
          <div><h3 className="text-white font-semibold mb-4">Company</h3><div className="space-y-2"><Link href="/pages/our-story" className="block hover:text-white">About Us</Link><Link href="/pages/join" className="block hover:text-white">Join HD Collective</Link></div></div>
          <div><h3 className="text-white font-semibold mb-4">Legal</h3><div className="space-y-2"><Link href="/pages/privacy-policy" className="block hover:text-white">Privacy</Link><Link href="/pages/terms-of-service" className="block hover:text-white">Terms</Link></div></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center">
          <p>{settings.copyright_text || '© 2024 HD Muscle. All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
}
