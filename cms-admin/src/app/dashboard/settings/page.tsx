'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="page-title text-white">General Settings</h1>
          <p className="text-slate-400 mt-1">Manage your store's basic information and branding.</p>
        </div>

        <Card>
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">Store Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Store Name" 
                value={settings.store_name} 
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} 
                placeholder="My Store"
              />
              <Input 
                label="Store Email" 
                type="email"
                value={settings.store_email} 
                onChange={(e) => setSettings({ ...settings, store_email: e.target.value })} 
                placeholder="contact@example.com"
              />
              <Input 
                label="Store Phone" 
                value={settings.store_phone} 
                onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })} 
                placeholder="+91 98765 43210"
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  <option value="INR" className="bg-slate-800">Indian Rupee (₹)</option>
                  <option value="USD" className="bg-slate-800">US Dollar ($)</option>
                  <option value="EUR" className="bg-slate-800">Euro (€)</option>
                  <option value="GBP" className="bg-slate-800">British Pound (£)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Store Address</label>
                <textarea
                  rows={3}
                  value={settings.store_address}
                  onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
                  placeholder="123 Main Street, City, State, PIN"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">Branding</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
                    placeholder="#f59e0b"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accent_color}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
                    placeholder="#ea580c"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button onClick={handleSave} loading={saving}>
            <SaveIcon className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}