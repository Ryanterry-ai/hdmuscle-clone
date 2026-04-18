'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, ChartBarIcon } from '@heroicons/react/outline';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    google_analytics_id: '',
    google_tag_manager_id: '',
    facebook_pixel_id: '',
    shopify_analytics: false,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/settings/analytics');
      const data = await res.json();
      setFormData({
        google_analytics_id: data.google_analytics_id || '',
        google_tag_manager_id: data.google_tag_manager_id || '',
        facebook_pixel_id: data.facebook_pixel_id || '',
        shopify_analytics: data.shopify_analytics || false,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings/analytics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Failed to save analytics:', error);
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">Configure tracking and analytics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Analytics & Tracking</h2>
              <p className="text-sm text-slate-500">Connect your analytics tools</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google Analytics ID</label>
            <input
              type="text"
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.google_analytics_id}
              onChange={(e) => setFormData({ ...formData, google_analytics_id: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-slate-400 mt-1">Found in your Google Analytics property settings</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google Tag Manager ID</label>
            <input
              type="text"
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.google_tag_manager_id}
              onChange={(e) => setFormData({ ...formData, google_tag_manager_id: e.target.value })}
              placeholder="GTM-XXXXXX"
            />
            <p className="text-xs text-slate-400 mt-1">Found in your Google Tag Manager container settings</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Facebook Pixel ID</label>
            <input
              type="text"
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.facebook_pixel_id}
              onChange={(e) => setFormData({ ...formData, facebook_pixel_id: e.target.value })}
              placeholder="1234567890"
            />
            <p className="text-xs text-slate-400 mt-1">Found in your Facebook Events Manager</p>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.shopify_analytics}
                onChange={(e) => setFormData({ ...formData, shopify_analytics: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Use Shopify Analytics</span>
                <p className="text-xs text-slate-500">Sync data with Shopify's built-in analytics</p>
              </div>
            </label>
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