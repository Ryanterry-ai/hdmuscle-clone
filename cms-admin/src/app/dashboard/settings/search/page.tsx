'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, PlusIcon, XIcon } from '@heroicons/react/outline';

interface SearchSettings {
  placeholder: string;
  show_trending: boolean;
  trending_terms: string[];
}

export default function SearchSettingsPage() {
  const [settings, setSettings] = useState<SearchSettings>({
    placeholder: 'Search products...',
    show_trending: true,
    trending_terms: [],
  });
  const [newTerm, setNewTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings/search');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings({
            placeholder: data.settings.placeholder || 'Search products...',
            show_trending: data.settings.show_trending ?? true,
            trending_terms: data.settings.trending_terms || [],
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
      await fetch('/api/settings/search', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          trending_terms: JSON.stringify(settings.trending_terms),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const addTerm = () => {
    if (newTerm.trim()) {
      setSettings({
        ...settings,
        trending_terms: [...settings.trending_terms, newTerm.trim()],
      });
      setNewTerm('');
    }
  };

  const removeTerm = (index: number) => {
    setSettings({
      ...settings,
      trending_terms: settings.trending_terms.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-stone-200 rounded-2xl"></div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Search Settings</h1>
        <p className="text-stone-500 mt-1">Configure the search functionality on your store.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Search Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Placeholder Text</label>
            <input
              type="text"
              value={settings.placeholder}
              onChange={(e) => setSettings({ ...settings, placeholder: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Search products..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div>
              <p className="font-medium text-stone-900">Show Trending Searches</p>
              <p className="text-sm text-stone-500">Display trending search terms below search bar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_trending}
                onChange={(e) => setSettings({ ...settings, show_trending: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {settings.show_trending && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-6">Trending Search Terms</h2>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTerm()}
              className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Add a trending term..."
            />
            <button
              onClick={addTerm}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium rounded-xl"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.trending_terms.map((term, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-full text-stone-700"
              >
                {term}
                <button onClick={() => removeTerm(index)} className="text-stone-400 hover:text-red-500">
                  <XIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
            {settings.trending_terms.length === 0 && (
              <p className="text-stone-400 text-sm">No trending terms added yet</p>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Preview</h2>
        <div className="bg-stone-100 rounded-xl p-4">
          <div className="relative">
            <input
              type="text"
              value={settings.placeholder}
              readOnly
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900"
            />
          </div>
          {settings.show_trending && settings.trending_terms.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-stone-500 mb-2">Trending:</p>
              <div className="flex flex-wrap gap-2">
                {settings.trending_terms.slice(0, 5).map((term, index) => (
                  <span key={index} className="px-3 py-1 bg-white rounded-full text-sm text-stone-600">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
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