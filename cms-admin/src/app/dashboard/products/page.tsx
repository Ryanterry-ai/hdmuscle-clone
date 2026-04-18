'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/outline';

interface Product {
  id: string;
  title: string;
  handle: string;
  price: string;
  compare_at_price: string | null;
  inventory: number;
  is_active: boolean;
  is_featured: boolean;
  images: { url: string }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.handle.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">{products.length} products in your store</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                            {product.images[0]?.url ? (
                              <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">💪</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{product.title}</p>
                            <p className="text-sm text-slate-500">/{product.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                            product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {product.is_active ? 'Active' : 'Draft'}
                          </span>
                          {product.is_featured && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Featured</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                          product.inventory < 50 ? 'text-amber-600' : 'text-slate-600'
                        }`}>
                          {product.inventory} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{formatCurrency(product.price)}</p>
                        {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                          <p className="text-xs text-slate-500 line-through">{formatCurrency(product.compare_at_price)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">Showing {filteredProducts.length} of {products.length} products</p>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No products found</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
              <PlusIcon className="w-5 h-5" />
              Add your first product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
