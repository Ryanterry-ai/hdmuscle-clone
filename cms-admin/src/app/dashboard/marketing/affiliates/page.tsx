'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/outline';

interface Affiliate {
  id: string;
  code: string;
  name: string;
  email: string | null;
  commission: number;
  is_active: boolean;
  orders_count: number;
  total_earnings: number;
  created_at: string;
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    commission: 10,
    is_active: true,
  });
  const [stats, setStats] = useState({ total: 0, active: 0, totalOrders: 0, totalEarnings: 0 });

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const res = await fetch('/api/affiliates');
      const data = await res.json();
      setAffiliates(data.affiliates || []);
      setStats(data.stats || { total: 0, active: 0, totalOrders: 0, totalEarnings: 0 });
    } catch (error) {
      console.error('Failed to fetch affiliates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setEditingAffiliate(null);
      setFormData({ code: '', name: '', email: '', commission: 10, is_active: true });
      fetchAffiliates();
    } catch (error) {
      console.error('Failed to save affiliate:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied!');
  };

  const filteredAffiliates = affiliates.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Affiliates</h1>
          <p className="text-slate-500 mt-1">{stats.total} affiliates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl">
          <PlusIcon className="w-5 h-5" />
          Add Affiliate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Earnings</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{formatCurrency(stats.totalEarnings)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search affiliates..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredAffiliates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Affiliate</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Code</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Commission</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Earnings</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAffiliates.map(aff => (
                  <tr key={aff.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{aff.name}</p>
                          <p className="text-sm text-slate-500">{aff.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">{aff.code}</code>
                        <button onClick={() => copyCode(aff.code)} className="text-xs text-slate-400 hover:text-slate-600">
                          Copy
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{aff.commission}%</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{aff.orders_count}</td>
                    <td className="px-6 py-4 text-sm font-medium text-amber-600">{formatCurrency(Number(aff.total_earnings))}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        aff.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {aff.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No affiliates yet</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
              <PlusIcon className="w-5 h-5" />
              Add your first affiliate
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Add Affiliate</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Affiliate Code</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                  placeholder="HDMUSCLE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Commission (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) })}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
                  Add Affiliate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}