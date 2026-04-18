'use client';

import { useState, useEffect } from 'react';
import { SaveIcon } from '@heroicons/react/outline';

interface GlobalSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: string;
  timezone: string;
  logo: string;
  favicon: string;
  primary_color: string;
  accent_color: string;
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>({
    store_name: '',
    store_email: '',
    store_phone: '',
    store_address: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    logo: '',
    favicon: '',
    primary_color: '#f59e0b',
    accent_color: '#ea580c',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings({
        store_name: data.store_name || '',
        store_email: data.store_email || '',
        store_phone: data.store_phone || '',
        store_address: data.store_address || '',
        currency: data.currency || 'INR',
        timezone: data.timezone || 'Asia/Kolkata',
        logo: data.logo || '',
        favicon: data.favicon || '',
        primary_color: data.primary_color || '#f59e0b',
        accent_color: data.accent_color || '#ea580c',
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
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
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">General Settings</h1>
        <p className="text-stone-500 mt-1">Manage your store&apos;s basic information and branding.</p>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Store Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Store Name</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="My Store"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Store Email</label>
            <input
              type="email"
              value={settings.store_email}
              onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="contact@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Store Phone</label>
            <input
              type="text"
              value={settings.store_phone}
              onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-2">Store Address</label>
            <textarea
              rows={3}
              value={settings.store_address}
              onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="123 Main Street, City, State, PIN"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Branding</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="w-12 h-12 rounded-xl border border-stone-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="#f59e0b"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.accent_color}
                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                className="w-12 h-12 rounded-xl border border-stone-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.accent_color}
                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="#ea580c"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          <SaveIcon className="w-5 h-5" />
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}