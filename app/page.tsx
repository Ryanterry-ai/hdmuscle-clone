'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from './header';
import Footer from './components/Footer';
import HomepageSections from './components/HomepageSections';
import { useCart } from './cart-context';
import {
  fetchStorefrontPayload,
  formatMoney,
  getHomepage,
  getProducts,
  getCollections,
  getSettings,
  type CMSData,
} from './lib/cms';

export default function HomePage() {
  const [data, setData] = useState<CMSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const { addItem } = useCart();

  useEffect(() => {
    fetchStorefrontPayload(true)
      .then((payload) => {
        setData(payload);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const settings = data ? getSettings(data) : null;
  const homepage = data ? getHomepage(data) : { sections: [] };
  const products = data ? getProducts(data) : [];
  const collections = data ? getCollections(data) : [];

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.featuredImageUrl,
    });

    setAddedProducts((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1200);
  };

  if (loading || !data || !settings) {
    return (
      <div className="page-loading">
        <div className="page-loading__spinner" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Header />

      <HomepageSections
        sections={homepage.sections}
        products={products}
        collections={collections}
        settings={settings}
        addedProducts={addedProducts}
        onAddToCart={handleAddToCart}
      />

      <Footer settings={settings} navigation={data.navigation} />
    </div>
  );
}