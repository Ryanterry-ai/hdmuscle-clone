'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';

interface Discount {
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: string;
  value: number;
  min_order_value: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  status: string;
  is_auto_apply: boolean;
  starts_at: string | null;
  expires_at: string | null;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/discounts');
      const data = await res.json();
      setDiscounts(data.discounts || []);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (discount: Discount) => {
    if (discount.type === 'PERCENTAGE') {
      return `${discount.value}% OFF`;
    }
    return `₹${discount.value} OFF`;
  };

  const filteredDiscounts = discounts.filter(d => 
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.title.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900">Discounts</h1>
          <p className="text-slate-500 mt-1">{discounts.length} discount codes</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
          <PlusIcon className="w-5 h-5" />
          Create Discount
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search discounts..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredDiscounts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredDiscounts.map((discount) => (
              <div key={discount.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{discount.title}</p>
                      <code className="px-2 py-0.5 bg-slate-100 rounded text-sm text-slate-600">{discount.code}</code>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {discount.description || 'No description'}
                      {discount.min_order_value && ` • Min order: ₹${discount.min_order_value}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{formatValue(discount)}</p>
                    <p className="text-xs text-slate-500">
                      {discount.usage_limit ? `${discount.used_count}/${discount.usage_limit} used` : `${discount.used_count} used`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    discount.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {discount.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No discount codes yet</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
              <PlusIcon className="w-5 h-5" />
              Create your first discount
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
