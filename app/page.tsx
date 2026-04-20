'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Header from './header';
import { useCart } from './cart-context';
import { formatCurrency } from './lib/cms';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  images: { url: string }[];
  is_active: boolean;
}

function AnnouncementBar() {
  return (
    <div className="bg-black text-white py-2.5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-center">
        <p className="text-xs font-semibold uppercase tracking-[2px] text-center">
          FREE SHIPPING ON ORDERS OVER $99 • 30-DAY MONEY BACK GUARANTEE •{' '}
          <Link href="/collections/best-selling-collection" className="underline hover:text-gray-300">
            SHOP NOW
          </Link>
        </p>
      </div>
    </div>
  );
}

function CategoryTiles({ collections }: { collections: any[] }) {
  const categories = [
    { title: 'Health + Wellness', image: 'https://hdmuscle.com/cdn/shop/files/img_4801.jpg' },
    { title: 'Pre-Workout', image: 'https://hdmuscle.com/cdn/shop/files/untitled_design_32.png' },
    { title: 'Intra-Workout', image: 'https://hdmuscle.com/cdn/shop/files/max09367.jpg' },
    { title: 'Post-Workout', image: 'https://hdmuscle.com/cdn/shop/files/untitled_design_28.png' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <Link key={i} href={`/collections/${collections[i]?.handle || 'all'}`} className="group relative aspect-square overflow-hidden">
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white font-bold text-lg uppercase tracking-[3px]">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection({ 
  title, 
  products, 
  settings, 
  onAddToCart, 
  viewAllLink 
}: { 
  title: string; 
  products: Product[]; 
  settings: any; 
  onAddToCart: (p: Product) => void; 
  viewAllLink: string;
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold uppercase tracking-[3px]">{title}</h2>
          <Link href={viewAllLink} className="text-sm font-semibold uppercase tracking-[1px] text-gray-500 flex items-center gap-2 hover:text-black">
            View All <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} settings={settings} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, settings, onAddToCart }: { product: Product; settings: any; onAddToCart: (p: Product) => void }) {
  return (
    <div className="bg-white border border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
      <Link href={`/products/${product.handle}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images?.[0]?.url ? (
            <img 
              src={product.images[0].url} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">💪</div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-xl font-bold text-purple-600">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </Link>
      <div className="px-5 pb-5">
        <button 
          onClick={() => onAddToCart(product)}
          className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[1.5px] hover:bg-purple-600 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function BrandStory() {
  return (
    <section className="grid md:grid-cols-2 min-h-[600px]">
      <div className="bg-gray-900 relative overflow-hidden">
        <img 
          src="https://hdmuscle.com/cdn/shop/files/dsc06090_copy.jpg" 
          alt="HD Muscle Story" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="bg-black text-white flex flex-col justify-center px-16 py-20">
        <span className="text-purple-500 text-xs font-bold uppercase tracking-[3px] mb-5">Our Mission</span>
        <h2 className="text-5xl font-bold uppercase tracking-[3px] mb-8">Built By Athletes, For Athletes</h2>
        <p className="text-gray-300 text-base leading-relaxed mb-6">
          At HD Muscle, we believe in the power of integrity. Every product we create is designed with one goal in mind: 
          to help you reach your full potential. We never compromise on quality, and we always disclose every ingredient. 
          Our supplements are manufactured in FDA-registered facilities using the highest quality ingredients.
        </p>
        <p className="text-gray-300 text-base leading-relaxed mb-10">Integrity is everything.</p>
        <span className="text-gray-500 text-2xl italic">— The HD Muscle Team</span>
      </div>
    </section>
  );
}

function Reviews() {
  const reviews = [
    { text: "THIS ONE WORKS! Almost works too good! I have never had a sports supplement work so well on my ability to not only fall asleep but literally sleep like a complete rock.", author: "Whitney L." },
    { text: "PreHD Ultra is my new gym bag essential, amazing pump, clean/non jittery energy, awesome taste, and properly dosed ingredients!", author: "Greg D." },
    { text: "All the products are top quality, everything tastes AMAZING! Your health is an investment, and if you invest in quality products your body will thank you!", author: "Christina D." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold uppercase tracking-[3px] mb-4">Real People, Real Reviews</h2>
          <p className="text-gray-500">See what our customers are saying</p>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 p-10">
              <div className="text-yellow-400 text-lg mb-5">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6">"{review.text}"</p>
              <p className="font-bold text-sm">— {review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black text-white py-20">
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-4 gap-16">
        <div>
          <h3 className="text-2xl font-bold uppercase tracking-[3px] mb-5">HD MUSCLE</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Premium sports nutrition supplements designed for athletes who demand more. Engineered for peak performance.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[2px] mb-6">Shop</h4>
          <ul className="space-y-3">
            <li><Link href="/collections/shop-all" className="text-gray-400 text-sm hover:text-white transition">All Products</Link></li>
            <li><Link href="/collections/pre-workouts" className="text-gray-400 text-sm hover:text-white transition">Pre-Workout</Link></li>
            <li><Link href="/collections/proteins" className="text-gray-400 text-sm hover:text-white transition">Protein</Link></li>
            <li><Link href="/collections/bundles" className="text-gray-400 text-sm hover:text-white transition">Bundles</Link></li>
            <li><Link href="/collections/apparel" className="text-gray-400 text-sm hover:text-white transition">Apparel</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[2px] mb-6">Support</h4>
          <ul className="space-y-3">
            <li><Link href="/pages/faq" className="text-gray-400 text-sm hover:text-white transition">FAQ</Link></li>
            <li><Link href="/pages/shipping-policy" className="text-gray-400 text-sm hover:text-white transition">Shipping Policy</Link></li>
            <li><Link href="/pages/refund-policy" className="text-gray-400 text-sm hover:text-white transition">Refund Policy</Link></li>
            <li><Link href="/pages/privacy-policy" className="text-gray-400 text-sm hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="/pages/contact" className="text-gray-400 text-sm hover:text-white transition">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[2px] mb-6">Company</h4>
          <ul className="space-y-3">
            <li><Link href="/pages/our-story" className="text-gray-400 text-sm hover:text-white transition">Our Story</Link></li>
            <li><Link href="/pages/wholesale" className="text-gray-400 text-sm hover:text-white transition">Wholesale</Link></li>
            <li><Link href="/pages/careers" className="text-gray-400 text-sm hover:text-white transition">Careers</Link></li>
            <li><Link href="/pages/press" className="text-gray-400 text-sm hover:text-white transition">Press</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 mt-16 pt-8 border-t border-gray-900 text-center">
        <p className="text-gray-600 text-sm">© 2024 HD MUSCLE. All rights reserved. Integrity is everything.</p>
      </div>
    </footer>
  );
}

const fallbackProducts: Product[] = [
  { id: '1', handle: 'prohd-whey', title: 'ProHD Whey Protein Isolate', price: '79.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/Chocolate.png' }], is_active: true },
  { id: '2', handle: 'prehd-essential', title: 'PreHD Essential', price: '39.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/PreHD-Essential-Blue-Rasberry.png' }], is_active: true },
  { id: '3', handle: 'pumphd', title: 'PumpHD', price: '49.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/PumpHD-Rainbow-Strips.png' }], is_active: true },
  { id: '4', handle: 'hydrahd', title: 'HydraHD', price: '44.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/HydraHD-Tangerine-US.png' }], is_active: true },
  { id: '5', handle: 'stimhd', title: 'StimHD', price: '54.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/StimHD.png' }], is_active: true },
  { id: '6', handle: 'intrahd', title: 'IntraHD', price: '39.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/intra_watermelon.png' }], is_active: true },
  { id: '7', handle: 'sleephd', title: 'SleepHD', price: '49.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/sleephd_web1.png' }], is_active: true },
  { id: '8', handle: 'greenshd', title: 'GreensHD', price: '59.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/greenshd-citrus-us.png' }], is_active: true },
  { id: '9', handle: 'burnhd', title: 'BurnHD', price: '49.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/burnhd_front.png' }], is_active: true },
  { id: '10', handle: 'creahd', title: 'CreaHD', price: '34.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/creahd.png' }], is_active: true },
  { id: '11', handle: 'multihd', title: 'MultiHD', price: '54.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/multi-hd-us-web.png' }], is_active: true },
  { id: '12', handle: 'glutahd', title: 'GlutaHD', price: '44.99', images: [{ url: 'https://hdmuscle.com/cdn/shop/files/glutahd.png' }], is_active: true },
];

const defaultSettings = {
  currency: 'USD',
  locale: 'en-US',
  symbol: '$',
  store_name: 'HD MUSCLE',
  copyright_text: '© 2024 HD MUSCLE. All rights reserved. Integrity is everything.'
};

export default function HomePage() {
  const { addItem } = useCart();

  const settings = defaultSettings;
  let products = fallbackProducts;
  const collections: any[] = [];

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, title: product.title, price: Number(product.price), image: product.images?.[0]?.url });
  };

  const bestSellers = products.slice(0, 8);
  const newProducts = products.slice(8, 12);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AnnouncementBar />
      <Header />

      <section className="relative h-[700px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
          <div className="max-w-[900px]">
            <h1 className="text-7xl md:text-8xl font-bold uppercase tracking-[8px] leading-tight mb-6">
              <span className="block bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Unleash
              </span>
              Your Potential
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-[600px] mx-auto">
              Premium supplements designed for athletes who demand more. Scientifically formulated to help you reach your peak performance.
            </p>
            <div className="flex gap-5 justify-center">
              <Link href="#products" className="px-10 py-4 bg-white text-black text-sm font-bold uppercase tracking-[2px] hover:bg-purple-600 hover:text-white transition">
                Shop Now
              </Link>
              <Link href="#about" className="px-10 py-4 border-2 border-white text-white text-sm font-bold uppercase tracking-[2px] hover:bg-white hover:text-black transition">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CategoryTiles collections={collections} />

      <div id="products">
        <ProductSection 
          title="Shop Our Best Sellers" 
          products={bestSellers} 
          settings={settings} 
          onAddToCart={handleAddToCart}
          viewAllLink="/collections/best-selling-collection"
        />
      </div>

      <ProductSection 
        title="New + Noteworthy" 
        products={newProducts} 
        settings={settings} 
        onAddToCart={handleAddToCart}
        viewAllLink="/collections/new-featured"
      />

      <div id="about">
        <BrandStory />
      </div>

      <Reviews />

      <section className="py-24 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold uppercase tracking-[3px] mb-4">You're Covered</h2>
          <p className="text-gray-300 mb-8">30-Day Money Back Guarantee on all orders</p>
          <Link href="/pages/shipping-policy" className="text-purple-500 font-semibold hover:underline">
            Learn More →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}