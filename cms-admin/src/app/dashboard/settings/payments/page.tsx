'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, CurrencyRupeeIcon, CreditCardIcon, TagIcon } from '@heroicons/react/outline';
import PublishButton from '@/components/PublishButton';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: number;
  compare_at_price: number | null;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Currency & Payment Settings
  const [settings, setSettings] = useState({
    currency: 'USD',
    currencySymbol: '$',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_enabled: false,
  });

  // Editing product price
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productPrice, setProductPrice] = useState({ price: 0, compare_at_price: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, productsRes] = await Promise.all([
        fetch('/api/settings/payments'),
        fetch('/api/products')
      ]);
      
      const settingsData = await settingsRes.json();
      const productsData = await productsRes.json();
      
      setSettings({
        currency: settingsData.currency || 'USD',
        currencySymbol: settingsData.currency === 'INR' ? '₹' : '$',
        razorpay_key_id: settingsData.razorpay_key_id || '',
        razorpay_key_secret: settingsData.razorpay_key_secret || '',
        razorpay_enabled: settingsData.enabled || false,
      });
      
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProductPrice = async () => {
    if (!editingProduct) return;
    
    setSaving(true);
    try {
      await fetch(`/api/products?id=${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseFloat(String(productPrice.price)),
          compare_at_price: parseFloat(String(productPrice.compare_at_price)) || null,
        }),
      });
      
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, price: productPrice.price, compare_at_price: productPrice.compare_at_price }
          : p
      ));
      
      setEditingProduct(null);
      alert('Price updated!');
    } catch (error) {
      console.error('Failed to update price:', error);
    } finally {
      setSaving(false);
    }
  };

  const openEditPrice = (product: Product) => {
    setEditingProduct(product);
    setProductPrice({
      price: product.price,
      compare_at_price: product.compare_at_price || 0,
    });
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
  ];

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments & Pricing</h1>
          <p className="text-slate-500 mt-1">Configure currency, prices, and payment gateway</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSaveSettings} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl">
            <SaveIcon className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <PublishButton />
        </div>
      </div>

      {/* Currency Settings */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <CurrencyRupeeIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Currency Settings</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                value={settings.currency}
                onChange={(e) => {
                  const curr = currencies.find(c => c.code === e.target.value);
                  setSettings({ ...settings, currency: e.target.value, currencySymbol: curr?.symbol || '$' });
                }}
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Settings */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Razorpay Payment Gateway</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.razorpay_enabled}
              onChange={(e) => setSettings({ ...settings, razorpay_enabled: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Enable Razorpay</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Key ID (rzp_...)</label>
            <input
              type="text"
              placeholder="rzp_..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
              value={settings.razorpay_key_id}
              onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Key Secret</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
              value={settings.razorpay_key_secret}
              onChange={(e) => setSettings({ ...settings, razorpay_key_secret: e.target.value })}
            />
          </div>
          
          <p className="text-sm text-slate-500">
            Get your keys from <a href="https://dashboard.razorpay.com" target="_blank" className="text-indigo-600 underline">Razorpay Dashboard</a>
          </p>
        </div>
      </div>

      {/* Product Prices */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <TagIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Product Prices</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Price ({settings.currencySymbol})</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Compare At</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{product.title}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-indigo-600">{settings.currencySymbol}{product.price}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {product.compare_at_price ? `${settings.currencySymbol}${product.compare_at_price}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditPrice(product)}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                      >
                        Edit Price
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Product Price Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Price: {editingProduct.title}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                  value={productPrice.price}
                  onChange={(e) => setProductPrice({ ...productPrice, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Compare At Price ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                  value={productPrice.compare_at_price}
                  onChange={(e) => setProductPrice({ ...productPrice, compare_at_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProductPrice}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}