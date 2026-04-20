'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './header';
import { useCart } from './cart-context';
import { fetchStorefrontPayload, getSettings, getProducts, getCollections, getHeroSection, formatCurrency } from './lib/cms';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  images: { url: string }[];
  is_active: boolean;
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

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 12).map((product: Product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition">
                <Link href={`/products/${product.handle}`}>
                  <div className="aspect-square bg-gray-100">
                    {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">💪</div>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{product.title}</h3>
                    <p className="text-red-600 font-bold">{formatCurrency(Number(product.price), settings.currency, settings.locale)}</p>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <button onClick={() => handleAddToCart(product)} className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-red-600 text-sm font-medium">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8">Subscribe for exclusive offers</p>
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