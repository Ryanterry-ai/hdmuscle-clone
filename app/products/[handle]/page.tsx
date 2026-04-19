'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../header';
import { useCart } from '../../cart-context';
import { fetchStorefrontPayload, getSettings, getProducts, formatCurrency } from '../../lib/cms';

export default function ProductPage() {
  const params = useParams();
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch('/api/storefront/published')
      .then(res => res.json())
      .then(data => {
        setPayload(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const settings = getSettings(payload);
  const products = getProducts(payload);
  const product = products.find((p: any) => p.handle === params.handle);

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/" className="text-red-600">Go Home</Link>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-xl">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">💪</div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-2xl text-red-600 font-bold mb-6">
              {formatCurrency(Number(product.price), settings.currency, settings.locale)}
            </p>
            <p className="text-gray-600 mb-4">{product.description || 'Premium quality supplement from HD Muscle.'}</p>
            {product.inventory > 0 ? (
              <p className="text-sm text-green-600 mb-8">✓ In Stock ({product.inventory} available)</p>
            ) : (
              <p className="text-sm text-red-600 mb-8">Out of Stock</p>
            )}
            <button 
              onClick={handleAddToCart}
              disabled={product.inventory <= 0}
              className={`w-full py-4 text-white font-bold rounded-lg transition ${
                added 
                  ? 'bg-green-600' 
                  : product.inventory <= 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {added ? '✓ Added to Cart!' : product.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}