'use client';

import { useEffect, useState } from 'react';
import { CreditCardIcon, CurrencyRupeeIcon, SaveIcon, TagIcon } from '@heroicons/react/outline';
import PublishButton from '@/components/PublishButton';

interface Product {
  id: string;
  handle: string;
  title: string;
  price: number;
  compare_at_price: number | null;
}

type PaymentSettings = {
  currency: string;
  currencySymbol: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  razorpay_enabled: boolean;
  snapmint_enabled: boolean;
  snapmint_checkout_url: string;
  snapmint_merchant_id: string;
};

const INR_SYMBOL = String.fromCharCode(8377);

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [settings, setSettings] = useState<PaymentSettings>({
    currency: 'INR',
    currencySymbol: INR_SYMBOL,
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_enabled: false,
    snapmint_enabled: false,
    snapmint_checkout_url: '',
    snapmint_merchant_id: '',
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productPrice, setProductPrice] = useState({ price: 0, compare_at_price: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, productsRes] = await Promise.all([fetch('/api/settings/payments'), fetch('/api/products')]);

      const settingsData = await settingsRes.json();
      const productsData = await productsRes.json();

      setSettings({
        currency: settingsData.currency || 'INR',
        currencySymbol: settingsData.currencySymbol || INR_SYMBOL,
        razorpay_key_id: settingsData.razorpay_key_id || '',
        razorpay_key_secret: settingsData.razorpay_key_secret || '',
        razorpay_enabled: Boolean(settingsData.razorpay_enabled),
        snapmint_enabled: Boolean(settingsData.snapmint_enabled),
        snapmint_checkout_url: settingsData.snapmint_checkout_url || '',
        snapmint_merchant_id: settingsData.snapmint_merchant_id || '',
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
      alert('Payment settings saved.');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Unable to save payment settings right now.');
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

      setProducts(
        products.map((product) =>
          product.id === editingProduct.id
            ? { ...product, price: productPrice.price, compare_at_price: productPrice.compare_at_price }
            : product,
        ),
      );

      setEditingProduct(null);
      alert('Price updated!');
    } catch (error) {
      console.error('Failed to update price:', error);
      alert('Unable to update product price right now.');
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

  const currencies = [{ code: 'INR', symbol: INR_SYMBOL, name: 'Indian Rupee' }];

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments & Pricing</h1>
          <p className="text-slate-500 mt-1">Configure INR pricing with Razorpay and Snapmint only</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
          >
            <SaveIcon className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <PublishButton />
        </div>
      </div>

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
                onChange={(event) => {
                  const curr = currencies.find((item) => item.code === event.target.value);
                  setSettings({
                    ...settings,
                    currency: event.target.value,
                    currencySymbol: curr?.symbol || INR_SYMBOL,
                  });
                }}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">Storefront currency is locked to INR for India operations.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                value={settings.currencySymbol}
                onChange={(event) => setSettings({ ...settings, currencySymbol: event.target.value || INR_SYMBOL })}
              />
            </div>
          </div>
        </div>
      </div>

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
              onChange={(event) => setSettings({ ...settings, razorpay_enabled: event.target.checked })}
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
              onChange={(event) => setSettings({ ...settings, razorpay_key_id: event.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Key Secret</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
              value={settings.razorpay_key_secret}
              onChange={(event) => setSettings({ ...settings, razorpay_key_secret: event.target.value })}
            />
          </div>

          <p className="text-sm text-slate-500">
            Get your keys from{' '}
            <a href="https://dashboard.razorpay.com" target="_blank" className="text-indigo-600 underline" rel="noreferrer">
              Razorpay Dashboard
            </a>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Snapmint EMI</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.snapmint_enabled}
              onChange={(event) => setSettings({ ...settings, snapmint_enabled: event.target.checked })}
              className="w-5 h-5 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Enable Snapmint messaging</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Snapmint Checkout URL</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
              value={settings.snapmint_checkout_url}
              onChange={(event) => setSettings({ ...settings, snapmint_checkout_url: event.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Snapmint Merchant ID</label>
            <input
              type="text"
              placeholder="Optional"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
              value={settings.snapmint_merchant_id}
              onChange={(event) => setSettings({ ...settings, snapmint_merchant_id: event.target.value })}
            />
          </div>

          <p className="text-sm text-slate-500">Only Razorpay and Snapmint are exposed on the storefront buy box.</p>
        </div>
      </div>

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
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{product.title}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-indigo-600">
                        {settings.currencySymbol}
                        {product.price}
                      </span>
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

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Price: {editingProduct.title}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg"
                  value={productPrice.price}
                  onChange={(event) => setProductPrice({ ...productPrice, price: parseFloat(event.target.value) || 0 })}
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
                  onChange={(event) =>
                    setProductPrice({
                      ...productPrice,
                      compare_at_price: parseFloat(event.target.value) || 0,
                    })
                  }
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

