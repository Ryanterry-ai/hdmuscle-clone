'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, GlobeIcon } from '@heroicons/react/outline';

export default function CurrencyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    store_email: 'info@hdmuscle.com',
    store_phone: '',
  });

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
        currency: 'INR',
        timezone: data.timezone || 'Asia/Kolkata',
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
      const response = await fetch('/api/settings/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currency: 'INR',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save failed:', response.status, errorText);
        alert(`Failed to save: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-gray-200" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Currency and Language</h1>
        <p className="mt-1 text-slate-500">Configure localization settings for the storefront.</p>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <GlobeIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Localization</h2>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Currency</label>
            <select
              className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value="INR"
              disabled
            >
              <option value="INR">₹ INR - Indian Rupee</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">Currency is locked to INR for the India storefront.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Timezone</label>
            <select
              className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">Used for order dates and announcements.</p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-4 font-medium text-slate-900">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Store Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.store_email}
                  onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
                  placeholder="info@hdmuscle.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Store Phone</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.store_phone}
                  onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 p-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <SaveIcon className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

