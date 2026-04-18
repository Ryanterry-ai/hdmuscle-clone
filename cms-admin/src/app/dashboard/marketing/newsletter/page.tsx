'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, TrashIcon, MailIcon, DownloadIcon } from '@heroicons/react/outline';

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  source: string | null;
  created_at: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', source: 'manual' });
  const [stats, setStats] = useState({ total: 0, active: 0, bySource: {} as Record<string, number> });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/newsletter');
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setStats(data.stats || { total: 0, active: 0, bySource: {} });
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ email: '', source: 'manual' });
      fetchSubscribers();
    } catch (error) {
      console.error('Failed to add subscriber:', error);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      await fetch(`/api/newsletter?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      fetchSubscribers();
    } catch (error) {
      console.error('Failed to remove subscriber:', error);
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'Status', 'Source', 'Date'];
    const rows = subscribers.map(s => [s.email, s.is_active ? 'Active' : 'Inactive', s.source || '', s.created_at]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900">Newsletter</h1>
          <p className="text-slate-500 mt-1">{stats.total} subscribers</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50">
            <DownloadIcon className="w-5 h-5" />
            Export
          </button>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl">
            <PlusIcon className="w-5 h-5" />
            Add Subscriber
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Subscribers</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">By Source</p>
          <div className="mt-2 space-y-1">
            {Object.entries(stats.bySource).map(([source, count]) => (
              <p key={source} className="text-sm text-slate-600"><span className="capitalize">{source}</span>: {count}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscribers..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Source</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <MailIcon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium text-slate-900">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        sub.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sub.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{sub.source || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(sub.email)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No subscribers yet</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
              <PlusIcon className="w-5 h-5" />
              Add your first subscriber
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Add Subscriber</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <option value="manual">Manual</option>
                  <option value="popup">Popup</option>
                  <option value="footer">Footer</option>
                  <option value="checkout">Checkout</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}