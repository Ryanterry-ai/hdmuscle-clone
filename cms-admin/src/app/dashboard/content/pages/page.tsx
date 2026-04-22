'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon, XIcon } from '@heroicons/react/outline';
import MediaPickerField from '@/components/MediaPickerField';

type PageRecord = {
  id: string;
  title: string;
  handle: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  is_active: boolean;
  is_featured: boolean;
  template: string;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
};

type PageFormState = {
  title: string;
  handle: string;
  excerpt: string;
  content: string;
  featured_image: string;
  template: string;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
};

const emptyForm: PageFormState = {
  title: '',
  handle: '',
  excerpt: '',
  content: '',
  featured_image: '',
  template: 'default',
  is_active: true,
  is_featured: false,
  meta_title: '',
  meta_description: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageRecord | null>(null);
  const [formData, setFormData] = useState<PageFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const [pagesRes, mediaRes] = await Promise.all([
        fetch('/api/pages', { credentials: 'include' }),
        fetch('/api/media', { credentials: 'include' }),
      ]);
      const pagesData = await pagesRes.json();
      const mediaData = await mediaRes.json();
      setPages(pagesData.pages || []);
      setMediaUrls((mediaData.media || []).map((item: any) => String(item.url || '')).filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((page) => [page.title, page.handle].join(' ').toLowerCase().includes(q));
  }, [pages, search]);

  const openCreate = () => {
    setEditingPage(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = async (page: PageRecord) => {
    try {
      const res = await fetch(`/api/pages/${page.id}`, { credentials: 'include' });
      if (!res.ok) {
        alert('Failed to load page details');
        return;
      }
      const fullPage = (await res.json()) as PageRecord;
      setEditingPage(fullPage);
      setFormData({
        title: fullPage.title || '',
        handle: fullPage.handle || '',
        excerpt: fullPage.excerpt || '',
        content: fullPage.content || '',
        featured_image: fullPage.featured_image || '',
        template: fullPage.template || 'default',
        is_active: fullPage.is_active,
        is_featured: fullPage.is_featured,
        meta_title: fullPage.meta_title || '',
        meta_description: fullPage.meta_description || '',
      });
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch page detail:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        handle: slugify(formData.handle || formData.title),
      };

      const url = editingPage ? `/api/pages/${editingPage.id}` : '/api/pages';
      const method = editingPage ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to save page');
        return;
      }

      setShowModal(false);
      setEditingPage(null);
      setFormData(emptyForm);
      await fetchPages();
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        alert('Failed to delete page');
        return;
      }
      await fetchPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
          <p className="mt-1 text-slate-500">{pages.length} pages in your store</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Page
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {filteredPages.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Page</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Template</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{page.title}</p>
                          <p className="text-sm text-slate-500">/{page.handle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              page.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {page.is_active ? 'Published' : 'Draft'}
                          </span>
                          {page.is_featured ? (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Featured</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-600">{page.template}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEdit(page)}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <p className="text-sm text-slate-500">Showing {filteredPages.length} of {pages.length} pages</p>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="mb-4 text-slate-500">No pages found</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5" />
              Add your first page
            </button>
          </div>
        )}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">{editingPage ? 'Edit Page' : 'Create Page'}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: event.target.value,
                      handle: prev.handle || slugify(event.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">URL Handle</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.handle}
                  onChange={(event) => setFormData((prev) => ({ ...prev, handle: slugify(event.target.value) }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Short Description</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(event) => setFormData((prev) => ({ ...prev, excerpt: event.target.value }))}
                />
              </div>

              <div>
                <MediaPickerField
                  theme="light"
                  label="Featured Media"
                  value={formData.featured_image}
                  onChange={(mediaUrl) => setFormData((prev) => ({ ...prev, featured_image: mediaUrl }))}
                  mediaUrls={mediaUrls}
                  datalistId="page-media-options"
                  helperText="Upload file or import URL, then save and publish."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Content</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={10}
                  value={formData.content}
                  onChange={(event) => setFormData((prev) => ({ ...prev, content: event.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Template</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.template}
                  onChange={(event) => setFormData((prev) => ({ ...prev, template: event.target.value }))}
                >
                  <option value="default">Default</option>
                  <option value="full-width">Full Width</option>
                  <option value="contact">Contact</option>
                  <option value="faq">FAQ</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">SEO Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={formData.meta_title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, meta_title: event.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">SEO Description</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={3}
                  value={formData.meta_description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, meta_description: event.target.value }))}
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(event) => setFormData((prev) => ({ ...prev, is_active: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Published</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(event) => setFormData((prev) => ({ ...prev, is_featured: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Featured</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingPage ? 'Update Page' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
