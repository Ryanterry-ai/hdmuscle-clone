'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../header';
import { useCart } from '../../cart-context';
import { getSettings, getProducts, getCollections, formatCurrency } from '../../lib/cms';

export default function CollectionPage() {
  const params = useParams();
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
  const collections = getCollections(payload);
  const collection = collections.find((c: any) => c.handle === params.handle);
  
  const allProducts = getProducts(payload);
  const products = allProducts.filter((p: any) => 
    p.collections?.some((pc: any) => pc.collection?.handle === params.handle)
  );

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0]?.url
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{collection?.title || params.handle}</h1>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition">
                <Link href={`/products/${product.handle}`}>
                  <div className="aspect-square bg-gray-100">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">💪</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-red-600 font-bold">
                      {formatCurrency(Number(product.price), settings.currency, settings.locale)}
                    </p>
                  </div>
                </Link>
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
          <p className="text-gray-500">No products in this collection</p>
        )}
      </main>
    </div>
  );
}