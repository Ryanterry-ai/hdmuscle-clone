'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, PhotographIcon } from '@heroicons/react/outline';

export default function LogoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/global');
      const data = await res.json();
      setLogo(data.logo || '');
      setFavicon(data.favicon || '');
      setPreviewLogo(data.logo || null);
      setPreviewFavicon(data.favicon || null);
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
        body: JSON.stringify({ logo, favicon }),
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
        <h1 className="text-2xl font-bold text-slate-900">Logo & branding</h1>
        <p className="text-slate-500 mt-1">Update your store logo and favicon</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Store Logo</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
            <input
              type="url"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {previewLogo && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-center">
                <img src={previewLogo} alt="Logo preview" className="h-16 object-contain" />
              </div>
            )}
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Favicon URL</label>
            <input
              type="url"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={favicon}
              onChange={(e) => setFavicon(e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
            {previewFavicon && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-center">
                <img src={previewFavicon} alt="Favicon preview" className="w-8 h-8 object-contain" />
              </div>
            )}
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