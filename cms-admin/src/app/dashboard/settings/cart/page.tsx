'use client';

import { useState, useEffect } from 'react';
import { SaveIcon } from '@heroicons/react/outline';
import MediaPickerField from '@/components/MediaPickerField';

interface CartDrawerSettings {
  promo_headline: string;
  promo_message: string;
  promo_image: string;
  show_promo: boolean;
  upsell_products: string;
}

export default function CartDrawerSettingsPage() {
  const [settings, setSettings] = useState<CartDrawerSettings>({
    promo_headline: '',
    promo_message: '',
    promo_image: '',
    show_promo: true,
    upsell_products: '[]',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [res, mediaRes] = await Promise.all([fetch('/api/settings/cart'), fetch('/api/media')]);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings({
            promo_headline: data.settings.promo_headline || '',
            promo_message: data.settings.promo_message || '',
            promo_image: data.settings.promo_image || '',
            show_promo: data.settings.show_promo ?? true,
            upsell_products: data.settings.upsell_products || '[]',
          });
        }
      }
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaUrls((mediaData.media || []).map((item: any) => String(item.url || '')).filter(Boolean));
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
      await fetch('/api/settings/cart', {
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
        <h1 className="text-2xl font-bold text-stone-900">Cart Drawer</h1>
        <p className="text-stone-500 mt-1">Configure the cart drawer promotional content.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-900">Promotional Banner</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_promo}
              onChange={(e) => setSettings({ ...settings, show_promo: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Headline</label>
            <input
              type="text"
              value={settings.promo_headline}
              onChange={(e) => setSettings({ ...settings, promo_headline: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Free shipping on orders above ₹500!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
            <textarea
              rows={2}
              value={settings.promo_message}
              onChange={(e) => setSettings({ ...settings, promo_message: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Add a complementary product to your cart"
            />
          </div>

          <div>
            <MediaPickerField
              theme="light"
              label="Promo Media"
              value={settings.promo_image}
              onChange={(mediaUrl) => setSettings({ ...settings, promo_image: mediaUrl })}
              mediaUrls={mediaUrls}
              datalistId="cart-promo-media-options"
              helperText="Upload image/video or import URL."
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Preview</h2>
        <div className="bg-stone-900 rounded-xl p-4">
          {settings.promo_image && (
            <img src={settings.promo_image} alt="" className="w-full h-32 object-cover rounded-lg mb-4" />
          )}
          {settings.promo_headline && (
            <p className="text-white font-bold text-lg">{settings.promo_headline}</p>
          )}
          {settings.promo_message && (
            <p className="text-stone-400 text-sm mt-1">{settings.promo_message}</p>
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
