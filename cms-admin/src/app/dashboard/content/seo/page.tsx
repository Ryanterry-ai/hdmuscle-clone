'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';

interface SEO {
  id: string;
  page: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_image: string | null;
}

const defaultPages = [
  { value: 'home', label: 'Homepage', description: 'Main store homepage' },
  { value: 'products', label: 'Products', description: 'All products listing' },
  { value: 'collections', label: 'Collections', description: 'All collections listing' },
  { value: 'about', label: 'About Us', description: 'About page' },
  { value: 'faq', label: 'FAQ', description: 'Frequently asked questions' },
  { value: 'contact', label: 'Contact', description: 'Contact page' },
  { value: 'blog', label: 'Blog', description: 'Blog/News section' },
];

export default function SEOPage() {
  const [seoRecords, setSeoRecords] = useState<SEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSEO, setEditingSEO] = useState<SEO | null>(null);
  const [formData, setFormData] = useState({
    page: '',
    title: '',
    description: '',
    keywords: '',
    og_image: '',
  });

  useEffect(() => {
    fetchSEO();
  }, []);

  const fetchSEO = async () => {
    try {
      const res = await fetch('/api/seo');
      const data = await res.json();
      setSeoRecords(data.seo || []);
    } catch (error) {
      console.error('Failed to fetch SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setEditingSEO(null);
      setFormData({ page: '', title: '', description: '', keywords: '', og_image: '' });
      fetchSEO();
    } catch (error) {
      console.error('Failed to save SEO:', error);
    }
  };

  const handleDelete = async (page: string) => {
    if (!confirm('Are you sure you want to delete this SEO record?')) return;
    try {
      await fetch(`/api/seo?page=${encodeURIComponent(page)}`, { method: 'DELETE' });
      fetchSEO();
    } catch (error) {
      console.error('Failed to delete SEO:', error);
    }
  };

  const openEdit = (seo: SEO) => {
    setEditingSEO(seo);
    setFormData({
      page: seo.page,
      title: seo.title || '',
      description: seo.description || '',
      keywords: seo.keywords || '',
      og_image: seo.og_image || '',
    });
    setShowModal(true);
  };

  const openNew = (page: string) => {
    setEditingSEO(null);
    setFormData({ page, title: '', description: '', keywords: '', og_image: '' });
    setShowModal(true);
  };

  const getSEOForPage = (page: string) => seoRecords.find(s => s.page === page);

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">SEO Settings</h1>
        <p className="text-slate-500 mt-1">Manage SEO meta tags for your store pages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultPages.map(defaultPage => {
          const seo = getSEOForPage(defaultPage.value);
          return (
            <div key={defaultPage.value} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{defaultPage.label}</h3>
                  <p className="text-sm text-slate-500 mt-1">{defaultPage.description}</p>
                </div>
                {seo ? (
                  <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                    Configured
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">
                    Not set
                  </span>
                )}
              </div>
              
              {seo && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 line-clamp-2">{seo.title}</p>
                  {seo.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1">{seo.description}</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                {seo ? (
                  <>
                    <button 
                      onClick={() => openEdit(seo)} 
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(seo.page)} 
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Remove
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => openNew(defaultPage.value)} 
                    className="flex-1 flex items-center justify-center gap-2 p-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add SEO
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {seoRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">All SEO Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Page</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seoRecords.map(seo => (
                  <tr key={seo.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{seo.page}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{seo.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{seo.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(seo)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(seo.page)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingSEO ? 'Edit SEO' : 'Add SEO'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Page</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  placeholder="e.g., home, products, about"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Title <span className="text-slate-400">(recommended: 50-60 characters)</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">{formData.title.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Description <span className="text-slate-400">(recommended: 150-160 characters)</span>
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">{formData.description.length}/160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keywords</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">OG Image URL</label>
                <input
                  type="url"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.og_image}
                  onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
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
                  {editingSEO ? 'Update' : 'Save'} SEO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}