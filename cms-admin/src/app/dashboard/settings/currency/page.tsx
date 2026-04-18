'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, GlobeIcon, CurrencyRupeeIcon } from '@heroicons/react/outline';

export default function CurrencyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    currency: 'USD',
    timezone: 'America/New_York',
    store_email: '',
    store_phone: '',
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  ];

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Toronto',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Kolkata',
    'Asia/Dubai',
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/global');
      const data = await res.json();
      setFormData({
        currency: data.currency || 'USD',
        timezone: data.timezone || 'America/New_York',
        store_email: data.store_email || '',
        store_phone: data.store_phone || '',
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Currency & Language</h1>
        <p className="text-slate-500 mt-1">Configure currency and localization settings</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <GlobeIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Localization</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
            <select
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">This affects prices displayed on your store</p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
            <select
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Used for order dates and announcements</p>
          </div>

          {/* Contact Info */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-medium text-slate-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.store_email}
                  onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
                  placeholder="info@hdmuscle.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.store_phone}
                  onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
                  placeholder="+1 555-123-4567"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50"
          >
            <SaveIcon className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}