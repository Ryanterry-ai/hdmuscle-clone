'use client';

import { useState, useEffect } from 'react';
import Header from './header';
import { useCart } from './cart-context';
import { useStore, formatCurrency } from './store-context';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  images: { url: string }[];
}

const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${CMS_API}/products?take=50&is_active=true`);
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function fetchCollections() {
  try {
    const res = await fetch(`${CMS_API}/collections`);
    const data = await res.json();
    return data.collections || [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { settings } = useStore();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCollections()])
      .then(([p, c]) => {
        setProducts(p);
        setCollections(c);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0]?.url
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="relative bg-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">FIND YOUR FORMULA</h1>
          <p className="text-xl text-gray-300 mb-8">Premium Quality Supplements for Athletes</p>
          <a href="/collections/best-selling-collection" className="inline-block px-8 py-3 bg-red-600 font-semibold rounded-lg hover:bg-red-700 transition">
            Shop All — Supplements
          </a>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {collections.slice(0, 8).map((col: any) => (
              <a key={col.id} href={`/collections/${col.handle}`} className="group">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {col.image ? (
                    <img src={col.image} alt={col.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                </div>
                <p className="mt-3 font-semibold text-center">{col.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 12).map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition">
                  <a href={`/products/${product.handle}`}>
                    <div className="aspect-square bg-gray-100">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">💪</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{product.title}</h3>
                      <p className="text-red-600 font-bold">
                        {formatCurrency(Number(product.price), settings.currency, settings.locale, settings.symbol)}
                      </p>
                    </div>
                  </a>
                  <div className="px-4 pb-4">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8">Subscribe for exclusive offers and updates</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900" />
            <button className="px-6 py-3 bg-red-600 font-semibold rounded-lg hover:bg-red-700 transition">Subscribe</button>
          </form>
        </div>
      </section>

      <footer className="bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <div className="space-y-2">
              <a href="/collections/pre-workouts" className="block hover:text-white">Pre-Workout</a>
              <a href="/collections/intra-workouts" className="block hover:text-white">Recovery</a>
              <a href="/collections/bundles" className="block hover:text-white">Bundles</a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <a href="/pages/faq" className="block hover:text-white">FAQ</a>
              <a href="/pages/contact" className="block hover:text-white">Contact</a>
              <a href="/pages/shipping-policy" className="block hover:text-white">Shipping</a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <div className="space-y-2">
              <a href="/pages/our-story" className="block hover:text-white">About Us</a>
              <a href="/pages/join" className="block hover:text-white">Join HD Collective</a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <div className="space-y-2">
              <a href="/pages/privacy-policy" className="block hover:text-white">Privacy</a>
              <a href="/pages/terms-of-service" className="block hover:text-white">Terms</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center">
          <p>© 2024 HD Muscle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}