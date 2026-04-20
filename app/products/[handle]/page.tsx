'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../header';
import { useCart } from '../../cart-context';

interface CMSData {
  settings: { announcement_bar?: any; symbol?: string };
  products: any[];
}

export default function ProductPage() {
  const params = useParams();
  const handle = params.handle as string;
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cmsData, setCmsData] = useState<CMSData | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    fetch('/api/storefront/published')
      .then(res => res.json())
      .then(data => {
        setCmsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const product = cmsData?.products?.find(p => p.handle === handle);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0]?.url
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const currencySymbol = cmsData?.settings?.symbol || '₹';
  const announcementText = cmsData?.settings?.announcement_bar?.text?.replace('$99', '₹9,999') || `FREE SHIPPING ON ORDERS OVER ₹9,999 • 30-DAY MONEY BACK GUARANTEE •`;
  const announcementLink = cmsData?.settings?.announcement_bar?.link || '/collections/best-selling-collection';

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-xl">Loading...</div></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-black text-white py-2.5">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-center">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[1px] md:tracking-[2px] text-center whitespace-nowrap">
              {announcementText}{' '}
              <Link href={announcementLink} className="underline hover:text-gray-300">SHOP NOW</Link>
            </p>
          </div>
        </div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 uppercase tracking-wider">Product Not Found</h1>
            <Link href="/" className="text-black hover:underline">← Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-2.5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-center">
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[1px] md:tracking-[2px] text-center whitespace-nowrap">
            {announcementText}{' '}
            <Link href={announcementLink} className="underline hover:text-gray-300">SHOP NOW</Link>
          </p>
        </div>
      </div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div className="aspect-square bg-gray-100 border border-black">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">💪</div>
            )}
          </div>
          <div>
            {product.badge && (
              <span className="inline-block bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wider mb-4">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[2px] mb-4">{product.title}</h1>
            <p className="text-2xl font-bold mb-6">{currencySymbol}{Number(product.price).toLocaleString('en-IN')}</p>
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
            {product.inventory > 0 ? (
              <p className="text-sm text-green-600 mb-8">✓ In Stock</p>
            ) : (
              <p className="text-sm text-red-600 mb-8">Out of Stock</p>
            )}
            <button 
              onClick={handleAddToCart}
              disabled={product.inventory <= 0}
              className={`w-full py-4 text-white text-sm font-bold uppercase tracking-[2px] transition ${
                added 
                  ? 'bg-green-600' 
                  : product.inventory <= 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800'
              }`}
            >
              {added ? '✓ Added to Cart!' : product.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </main>
      <footer className="bg-black text-white py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <p className="text-gray-500 text-sm">© 2024 HD MUSCLE. All rights reserved. Integrity is everything.</p>
        </div>
      </footer>
    </div>
  );
}