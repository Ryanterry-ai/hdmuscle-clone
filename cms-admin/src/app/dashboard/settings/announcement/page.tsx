'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, TrashIcon } from '@heroicons/react/outline';

interface Announcement {
  id?: string;
  message: string;
  link: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
}

export default function AnnouncementSettingsPage() {
  const [announcement, setAnnouncement] = useState<Announcement>({
    message: '',
    link: '',
    is_active: true,
    starts_at: '',
    expires_at: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    try {
      const res = await fetch('/api/settings/announcement');
      if (res.ok) {
        const data = await res.json();
        if (data.announcement) {
          setAnnouncement(data.announcement);
        }
      }
    } catch (error) {
      console.error('Failed to load announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement),
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
        <h1 className="text-2xl font-bold text-stone-900">Announcement Bar</h1>
        <p className="text-stone-500 mt-1">Configure the announcement bar that appears at the top of your store.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-900">Enable Announcement</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={announcement.is_active}
              onChange={(e) => setAnnouncement({ ...announcement, is_active: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Announcement Message</label>
            <input
              type="text"
              value={announcement.message}
              onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Free shipping on orders above ₹500!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Link (optional)</label>
            <input
              type="text"
              value={announcement.link}
              onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="/pages/offer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={announcement.starts_at}
                onChange={(e) => setAnnouncement({ ...announcement, starts_at: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">End Date</label>
              <input
                type="datetime-local"
                value={announcement.expires_at}
                onChange={(e) => setAnnouncement({ ...announcement, expires_at: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Preview</h2>
        <div className="bg-stone-900 text-white py-3 px-4 rounded-xl text-center">
          {announcement.message || 'Your announcement message will appear here'}
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