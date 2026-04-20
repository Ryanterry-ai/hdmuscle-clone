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
  badge?: string;
  is_active: boolean;
}

function AnnouncementBar() {
  return (
    <div className="bg-black text-white py-2.5 sticky top-0 z-40">
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

function QualityBadges() {
  const badges = [
    { icon: '🧪', text: 'Heavy Metals Tested' },
    { icon: '🎨', text: 'No Artificial Dyes' },
    { icon: '✅', text: '3rd Party Tested' },
    { icon: '💊', text: 'Properly Dosed' },
    { icon: '🏭', text: 'FDA Registered Facility' },
  ];

  return (
    <section className="py-8 bg-gray-50 border-b">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">{badge.icon}</span>
              <span className="font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTiles() {
  const categories = [
    { title: 'Health + Wellness', image: '/greenshd-citrus-us-b1d785092f3e.jpg' },
    { title: 'Pre-Workout', image: '/pumphd-rainbow-strips-ead9f7c7e482.png' },
    { title: 'Intra-Workout', image: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png' },
    { title: 'Post-Workout', image: '/creahd-53c587c6f495.jpg' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <Link key={i} href={`/collections/${cat.title.toLowerCase().replace(/[^a-z]/g, '-')}`} className="group relative aspect-square overflow-hidden">
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

function ProductCard({ product, settings, onAddToCart }: { product: Product; settings: any; onAddToCart: (p: Product) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white border border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
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
            <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 uppercase">
              {product.badge}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-2">{product.title}</h3>
          <p className="text-xl font-bold text-purple-600">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button 
          onClick={() => onAddToCart(product)}
          className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-[1.5px] hover:bg-purple-600 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductSection({ title, products, settings, onAddToCart, viewAllLink }: { title: string; products: Product[]; settings: any; onAddToCart: (p: Product) => void; viewAllLink: string }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold uppercase tracking-[3px]">{title}</h2>
          <Link href={viewAllLink} className="text-sm font-semibold uppercase tracking-[1px] text-gray-500 flex items-center gap-2 hover:text-black">
            View All <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} settings={settings} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="grid md:grid-cols-2 min-h-[500px]">
      <div className="bg-gray-900 relative overflow-hidden">
        <img 
          src="/hdmusclebrand2-1775078638960-180ba2bc3e7b.webp" 
          alt="HD Muscle Story" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="bg-black text-white flex flex-col justify-center px-12 py-16">
        <span className="text-purple-500 text-xs font-bold uppercase tracking-[3px] mb-4">Our Mission</span>
        <h2 className="text-4xl font-bold uppercase tracking-[3px] mb-6">Built By Athletes, For Athletes</h2>
        <p className="text-gray-300 text-base leading-relaxed mb-4">
          At HD Muscle, we believe in the power of integrity. Every product we create is designed with one goal in mind: to help you reach your full potential.
        </p>
        <p className="text-gray-300 text-base leading-relaxed mb-8">Integrity is everything.</p>
        <span className="text-gray-500 text-2xl italic">— The HD Muscle Team</span>
      </div>
    </section>
  );
}

function Reviews() {
  const reviews = [
    { text: "THIS ONE WORKS! Almost works too good! I have never had a sports supplement work so well on my ability to not only fall asleep but literally sleep like a complete rock.", author: "Whitney L.", stars: 5 },
    { text: "PreHD Ultra is my new gym bag essential, amazing pump, clean/non jittery energy, awesome taste, and properly dosed ingredients!", author: "Greg D.", stars: 5 },
    { text: "All the products are top quality, everything tastes AMAZING! Your health is an investment, and if you invest in quality products your body will thank you!", author: "Christina D.", stars: 5 },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold uppercase tracking-[3px] mb-3">Real People, Real Reviews</h2>
          <p className="text-gray-500">See what our customers are saying</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 p-8">
              <div className="text-yellow-400 text-lg mb-4">
                {[...Array(review.stars)].map((_, j) => <i key={j} className="fas fa-star"></i>)}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-5">"{review.text}"</p>
              <p className="font-bold text-sm">— {review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "How long does shipping take?", a: "Free shipping on orders over $99. Standard shipping takes 3-5 business days." },
    { q: "What's your return policy?", a: "We offer a 30-day money-back guarantee on all products." },
    { q: "Are your products GMP certified?", a: "Yes, all our products are manufactured in FDA-registered GMP certified facilities." },
    { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide." },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[800px] mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 uppercase tracking-[3px]">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white border border-gray-200">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold list-none">
                {faq.q}
                <i className="fas fa-chevron-down text-xs transition group-open:rotate-180"></i>
              </summary>
              <p className="px-4 pb-4 text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="py-16 bg-black text-white">
      <div className="max-w-[600px] mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-[3px] mb-4">Stay Updated</h2>
        <p className="text-gray-400 mb-6">Subscribe for exclusive offers and new product launches</p>
        <form className="flex gap-3">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
          />
          <button className="px-8 py-3 bg-purple-600 font-bold uppercase tracking-[1px] hover:bg-purple-700 transition">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-5 gap-8">
        <div className="col-span-1">
          <h3 className="text-2xl font-bold uppercase tracking-[3px] mb-5">HD MUSCLE</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Premium sports nutrition supplements designed for athletes who demand more.
          </p>
          <div className="flex gap-3">
            <a href="https://instagram.com/hd.muscle" className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://facebook.com/hdmuscle" className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://youtube.com/hdmuscle" className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://tiktok.com/@hdmuscle" className="w-10 h-10 border border-gray-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition">
              <i className="fab fa-tiktok"></i>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[2px] mb-5">Shop</h4>
          <ul className="space-y-3">
            <li><Link href="/collections/all" className="text-gray-400 text-sm hover:text-white transition">All Products</Link></li>
            <li><Link href="/collections/pre-workouts" className="text-gray-400 text-sm hover:text-white transition">Pre-Workout</Link></li>
            <li><Link href="/collections/proteins" className="text-gray-400 text-sm hover:text-white transition">Protein</Link></li>
            <li><Link href="/collections/bundles" className="text-gray-400 text-sm hover:text-white transition">Bundles</Link></li>
            <li><Link href="/collections/apparel" className="text-gray-400 text-sm hover:text-white transition">Apparel</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[2px] mb-5">Support</h4>
          <ul className="space-y-3">
            <li><Link href="/pages/faq" className="text-gray-400 text-sm hover:text-white transition">FAQ</Link></li>
            <li><Link href="/pages/shipping-policy" className="text-gray-400 text-sm hover:text-white transition">Shipping Policy</Link></li>
            <li><Link href="/pages/refund-policy" className="text-gray-400 text-sm hover:text-white transition">Refund Policy</Link></li>
            <li><Link href="/pages/privacy-policy" className="text-gray-400 text-sm hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="/pages/contact" className="text-gray-400 text-sm hover:text-white transition">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[2px] mb-5">Company</h4>
          <ul className="space-y-3">
            <li><Link href="/pages/our-story" className="text-gray-400 text-sm hover:text-white transition">Our Story</Link></li>
            <li><Link href="/pages/wholesale" className="text-gray-400 text-sm hover:text-white transition">Wholesale</Link></li>
            <li><Link href="/pages/careers" className="text-gray-400 text-sm hover:text-white transition">Careers</Link></li>
            <li><Link href="/pages/press" className="text-gray-400 text-sm hover:text-white transition">Press</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[2px] mb-5">Country</h4>
          <select className="bg-gray-800 text-gray-400 text-sm px-3 py-2 border border-gray-700 rounded">
            <option>United States</option>
            <option>Canada</option>
            <option>United Kingdom</option>
            <option>Australia</option>
            <option>India</option>
          </select>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 mt-12 pt-8 border-t border-gray-900 text-center">
        <p className="text-gray-600 text-sm">© 2024 HD MUSCLE. All rights reserved. Integrity is everything.</p>
      </div>
    </footer>
  );
}

const fallbackProducts: Product[] = [
  { id: '1', handle: 'prohd-whey', title: 'ProHD Whey Protein Isolate', price: '79.99', images: [{ url: '/prohd_chocolate_front-1cca5974cf27.png' }], badge: 'Best Seller', is_active: true },
  { id: '2', handle: 'prehd-essential', title: 'PreHD Essential', price: '39.99', images: [{ url: '/prehd-essential-blue-rasberry-eb39ae9ce7f5.png' }], is_active: true },
  { id: '3', handle: 'pumphd', title: 'PumpHD', price: '49.99', images: [{ url: '/pumphd-rainbow-strips-ead9f7c7e482.png' }], badge: 'New', is_active: true },
  { id: '4', handle: 'hydrahd', title: 'HydraHD', price: '44.99', images: [{ url: '/hydrahd-tangerine-us-16303cf76229.png' }], is_active: true },
  { id: '5', handle: 'stimhd', title: 'StimHD', price: '54.99', images: [{ url: '/stimhd_9d7400de-4473-4af8-bd68-902c6689781d-fdd59a2755d1.png' }], is_active: true },
  { id: '6', handle: 'intrahd', title: 'IntraHD', price: '39.99', images: [{ url: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png' }], is_active: true },
  { id: '7', handle: 'sleephd', title: 'SleepHD', price: '49.99', images: [{ url: '/sleephd_web1-d6d6eabbf104.png' }], is_active: true },
  { id: '8', handle: 'greenshd', title: 'GreensHD', price: '59.99', images: [{ url: '/greenshd-citrus-us-b1d785092f3e.jpg' }], is_active: true },
  { id: '9', handle: 'burnhd', title: 'BurnHD', price: '49.99', images: [{ url: '/burnhd_front-b81b8d88cde6.png' }], is_active: true },
  { id: '10', handle: 'creahd', title: 'CreaHD', price: '34.99', images: [{ url: '/creahd-53c587c6f495.jpg' }], is_active: true },
  { id: '11', handle: 'multihd', title: 'MultiHD', price: '54.99', images: [{ url: '/multi-hd-us-web-11980b086482.jpg' }], is_active: true },
  { id: '12', handle: 'glutahd', title: 'GlutaHD', price: '44.99', images: [{ url: '/glutahd-front-black-lid-0e6436cfe231.jpg' }], is_active: true },
  { id: '13', handle: 'prehd-elite', title: 'PreHD Elite', price: '64.99', images: [{ url: '/prehd-elite_tangerine-can-v2-15e1790f303a.jpg' }], badge: 'New', is_active: true },
  { id: '14', handle: 'eaahd', title: 'EAAHD', price: '44.99', images: [{ url: '/eaahd_front_unflavored-black-lid-b9e66b2a11b7.png' }], is_active: true },
  { id: '15', handle: 'collagenhd', title: 'CollagenHD', price: '49.99', images: [{ url: '/collagenhd_front_unflavored-us-6c934157a97a.jpg' }], is_active: true },
];

const apparelProducts: Product[] = [
  { id: '16', handle: 'hd-heritage-hoodie', title: 'HD Heritage Hoodie', price: '69.99', images: [{ url: '/hd-heritage-hoodie-black-front-d19ea4b2ddab.jpg' }], badge: 'New', is_active: true },
  { id: '17', handle: 'hd-archive-hat', title: 'HD Archive Hat', price: '34.99', images: [{ url: '/hd-archive-hat-2026-black-199357851230.png' }], is_active: true },
  { id: '18', handle: 'hd-jersey', title: 'HD Jersey', price: '54.99', images: [{ url: '/hd-jersey-black-front-15e6447e1daf.jpg' }], is_active: true },
  { id: '19', handle: 'hd-gothic-tee', title: 'HD Gothic Tee', price: '39.99', images: [{ url: '/hd-gothic-black-front-2b467fb27e06.png' }], is_active: true },
  { id: '20', handle: 'hd-performa-shaker', title: 'HD Performa Shaker', price: '14.99', images: [{ url: '/1800x1800-hd-performa-shaker-black-354aba4223e2.png' }], is_active: true },
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
  const products = fallbackProducts;
  const collections: any[] = [];

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, title: product.title, price: Number(product.price), image: product.images?.[0]?.url });
  };

  const bestSellers = products.slice(0, 10);
  const newProducts = products.slice(3, 10);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AnnouncementBar />
      <Header />

      <section className="relative h-[600px] bg-gray-900 overflow-hidden">
        <img 
          src="/hdmuscle72-1775078686011-5c8049f904ea.webp" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
          <div className="max-w-[800px]">
            <h1 className="text-6xl md:text-7xl font-bold uppercase tracking-[6px] mb-6">
              Find Your Formula
            </h1>
            <p className="text-lg text-gray-200 mb-10 max-w-[500px] mx-auto">
              Premium supplements designed for athletes who demand more. Scientifically formulated to help you reach your peak performance.
            </p>
            <div className="flex gap-4 justify-center">
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

      <QualityBadges />

      <CategoryTiles />

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

      <ProductSection 
        title="New Arrivals — Apparel + Accessories" 
        products={apparelProducts} 
        settings={settings} 
        onAddToCart={handleAddToCart}
        viewAllLink="/collections/apparel"
      />

      <FAQSection />

      <section className="py-16 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold uppercase tracking-[3px] mb-4">You're Covered</h2>
          <p className="text-gray-300 mb-8">30-Day Money Back Guarantee on all orders</p>
          <Link href="/pages/shipping-policy" className="text-purple-500 font-semibold hover:underline">
            Learn More →
          </Link>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
}
