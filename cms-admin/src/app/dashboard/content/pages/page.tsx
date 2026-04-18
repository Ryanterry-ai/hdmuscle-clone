'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/outline';

interface Page {
  id: string;
  title: string;
  handle: string;
  excerpt: string | null;
  is_active: boolean;
  is_featured: boolean;
  template: string;
  created_at: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    handle: '',
    excerpt: '',
    content: '',
    template: 'default',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pages', {
        method: editingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPage ? { ...formData, id: editingPage.id } : formData),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingPage(null);
        setFormData({ title: '', handle: '', excerpt: '', content: '', template: 'default', is_active: true, is_featured: false });
        fetchPages();
      }
    } catch (error) {
      console.error('Failed to save page:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await fetch(`/api/pages?id=${id}`, { method: 'DELETE' });
      fetchPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const openEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      handle: page.handle,
      excerpt: page.excerpt || '',
      content: '',
      template: page.template,
      is_active: page.is_active,
      is_featured: page.is_featured,
    });
    setShowModal(true);
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.handle.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
          <p className="text-slate-500 mt-1">{pages.length} pages in your store</p>
        </div>
        <button 
          onClick={() => { setEditingPage(null); setFormData({ title: '', handle: '', excerpt: '', content: '', template: 'default', is_active: true, is_featured: false }); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Page
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredPages.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Page</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Template</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{page.title}</p>
                          <p className="text-sm text-slate-500">/{page.handle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                            page.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {page.is_active ? 'Active' : 'Draft'}
                          </span>
                          {page.is_featured && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Featured</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 capitalize">{page.template}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(page)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(page.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">Showing {filteredPages.length} of {pages.length} pages</p>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No pages found</p>
            <button 
              onClick={() => { setEditingPage(null); setFormData({ title: '', handle: '', excerpt: '', content: '', template: 'default', is_active: true, is_featured: false }); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
            >
              <PlusIcon className="w-5 h-5" />
              Add your first page
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{editingPage ? 'Edit Page' : 'Create Page'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, handle: editingPage ? formData.handle : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Handle</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                >
                  <option value="default">Default</option>
                  <option value="full-width">Full Width</option>
                  <option value="contact">Contact</option>
                  <option value="faq">FAQ</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Featured</span>
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
                  {editingPage ? 'Update' : 'Create'} Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}