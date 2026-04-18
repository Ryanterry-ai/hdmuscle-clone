'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/outline';

interface Popup {
  id: string;
  title: string;
  content: string;
  trigger_type: string;
  trigger_value: number;
  is_active: boolean;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    trigger_type: 'TIME',
    trigger_value: 5,
    is_active: true,
    status: 'ACTIVE',
    starts_at: '',
    expires_at: '',
  });

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const res = await fetch('/api/popups');
      const data = await res.json();
      setPopups(data.popups || []);
    } catch (error) {
      console.error('Failed to fetch popups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        starts_at: formData.starts_at ? new Date(formData.starts_at) : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at) : null,
      };
      
      if (editingPopup) {
        await fetch(`/api/popups?id=${editingPopup.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/popups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      
      setShowModal(false);
      setEditingPopup(null);
      setFormData({ title: '', content: '', trigger_type: 'TIME', trigger_value: 5, is_active: true, status: 'ACTIVE', starts_at: '', expires_at: '' });
      fetchPopups();
    } catch (error) {
      console.error('Failed to save popup:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;
    try {
      await fetch(`/api/popups?id=${id}`, { method: 'DELETE' });
      fetchPopups();
    } catch (error) {
      console.error('Failed to delete popup:', error);
    }
  };

  const openEdit = (popup: Popup) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title,
      content: popup.content,
      trigger_type: popup.trigger_type,
      trigger_value: popup.trigger_value,
      is_active: popup.is_active,
      status: popup.status,
      starts_at: popup.starts_at ? popup.starts_at.slice(0, 16) : '',
      expires_at: popup.expires_at ? popup.expires_at.slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const triggerTypes = [
    { value: 'TIME', label: 'Time delay', description: 'Show after X seconds' },
    { value: 'SCROLL', label: 'Scroll amount', description: 'Show after scrolling X%' },
    { value: 'EXIT', label: 'Exit intent', description: 'Show when user tries to leave' },
    { value: 'PAGE_LOAD', label: 'Page load', description: 'Show immediately on page load' },
  ];

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
          <h1 className="text-2xl font-bold text-slate-900">Popups</h1>
          <p className="text-slate-500 mt-1">{popups.length} popups in your store</p>
        </div>
        <button 
          onClick={() => { setEditingPopup(null); setFormData({ title: '', content: '', trigger_type: 'TIME', trigger_value: 5, is_active: true, status: 'ACTIVE', starts_at: '', expires_at: '' }); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Create Popup
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {popups.map(popup => (
          <div key={popup.id} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{popup.title}</h3>
                <p className="text-sm text-slate-500 mt-1 capitalize">{popup.trigger_type.toLowerCase()} trigger</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                popup.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {popup.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 line-clamp-3 mb-4">{popup.content}</p>
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <button onClick={() => openEdit(popup)} className="flex-1 flex items-center justify-center gap-2 p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => handleDelete(popup.id)} className="flex-1 flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}

        {popups.length === 0 && (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 mb-4">No popups created yet</p>
              <button 
                onClick={() => { setEditingPopup(null); setFormData({ title: '', content: '', trigger_type: 'TIME', trigger_value: 5, is_active: true, status: 'ACTIVE', starts_at: '', expires_at: '' }); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
              >
                <PlusIcon className="w-5 h-5" />
                Create your first popup
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{editingPopup ? 'Edit Popup' : 'Create Popup'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Trigger Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {triggerTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, trigger_type: type.value })}
                      className={`p-3 rounded-lg border text-left transition ${
                        formData.trigger_type === type.value
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-medium text-slate-900 text-sm">{type.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              {formData.trigger_type !== 'PAGE_LOAD' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {formData.trigger_type === 'TIME' ? 'Delay (seconds)' : 'Scroll percentage (%)'}
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.trigger_value}
                    onChange={(e) => setFormData({ ...formData, trigger_value: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
                >
                  {editingPopup ? 'Update' : 'Create'} Popup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}