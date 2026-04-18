'use client';

import { useState, useEffect } from 'react';
import { SaveIcon } from '@heroicons/react/outline';

interface FooterSettings {
  description: string;
  show_newsletter: boolean;
  columns: string;
  copyright: string;
}

export default function FooterSettingsPage() {
  const [settings, setSettings] = useState<FooterSettings>({
    description: '',
    show_newsletter: true,
    columns: '[]',
    copyright: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings/footer');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings({
            description: data.settings.description || '',
            show_newsletter: data.settings.show_newsletter ?? true,
            columns: data.settings.columns || '[]',
            copyright: data.settings.copyright || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-stone-200 rounded-2xl"></div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Footer Settings</h1>
        <p className="text-stone-500 mt-1">Configure your store&apos;s footer.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Footer Content</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Footer Description</label>
            <textarea
              rows={3}
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Your store description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Copyright Text</label>
            <input
              type="text"
              value={settings.copyright}
              onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="© 2024 My Store. All rights reserved."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div>
              <p className="font-medium text-stone-900">Show Newsletter Signup</p>
              <p className="text-sm text-stone-500">Display newsletter signup form in footer</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_newsletter}
                onChange={(e) => setSettings({ ...settings, show_newsletter: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

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