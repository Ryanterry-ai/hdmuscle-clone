'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../header';
import { useCart } from '../../cart-context';
import { useStore, formatCurrency } from '../../store-context';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  images: { url: string }[];
}

export default function CollectionPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { settings } = useStore();

  useEffect(() => {
    fetch(`/api/products?take=50&collection_handle=${params.handle}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setCollection({ title: params.handle });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.handle]);

  const handleAddToCart = (product: Product) => {
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
            {products.map((product) => (
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
                    <h3 className="font-semibold">{product.title}</h3>
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
          <p className="text-gray-500">No products in this collection</p>
        )}
      </main>
    </div>
  );
}