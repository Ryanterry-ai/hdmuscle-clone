'use client';

import { useState, useEffect } from 'react';
import { SaveIcon } from '@heroicons/react/outline';
import MediaPickerField from '@/components/MediaPickerField';

export default function LogoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [settingsRes, mediaRes] = await Promise.all([
        fetch('/api/settings/global'),
        fetch('/api/media'),
      ]);
      const data = await settingsRes.json();
      const mediaData = await mediaRes.json();
      setLogo(data.logo || '');
      setFavicon(data.favicon || '');
      setMediaUrls((mediaData.media || []).map((item: any) => String(item.url || '')).filter(Boolean));
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
            <MediaPickerField
              theme="light"
              label="Logo"
              value={logo}
              onChange={setLogo}
              mediaUrls={mediaUrls}
              datalistId="logo-media-options"
              helperText="Attach/upload logo or import logo URL."
            />
          </div>

          {/* Favicon */}
          <div>
            <MediaPickerField
              theme="light"
              label="Favicon"
              value={favicon}
              onChange={setFavicon}
              mediaUrls={mediaUrls}
              datalistId="favicon-media-options"
              helperText="Attach/upload favicon (.png, .ico, .svg) or import URL."
            />
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
