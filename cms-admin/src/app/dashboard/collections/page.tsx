'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
  SearchIcon,
} from '@heroicons/react/outline';
import MediaPickerField from '@/components/MediaPickerField';

type Product = {
  id: string;
  title: string;
  handle: string;
};

type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  is_active: boolean;
  sort_order?: number;
  products_count?: number;
  product_ids?: string[];
};

type CollectionFormState = {
  title: string;
  handle: string;
  description: string;
  image: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  is_active: boolean;
  product_ids: string[];
};

const emptyForm: CollectionFormState = {
  title: '',
  handle: '',
  description: '',
  image: '',
  seo_title: '',
  seo_description: '',
  sort_order: 0,
  is_active: true,
  product_ids: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CollectionFormState>(emptyForm);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [collectionsRes, productsRes, mediaRes] = await Promise.all([
        fetch('/api/collections', { credentials: 'include' }),
        fetch('/api/products?take=500', { credentials: 'include' }),
        fetch('/api/media', { credentials: 'include' }),
      ]);

      const collectionsData = await collectionsRes.json();
      const productsData = await productsRes.json();
      const mediaData = await mediaRes.json();

      setCollections(collectionsData.collections || []);
      setProducts((productsData.products || []).map((p: any) => ({ id: p.id, title: p.title, handle: p.handle })));
      setMediaUrls((mediaData.media || []).map((item: any) => String(item.url || '')).filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter((collection) =>
      [collection.title, collection.handle, collection.description || ''].join(' ').toLowerCase().includes(q)
    );
  }, [collections, search]);

  const openModal = (collection?: Collection) => {
    if (!collection) {
      setEditingCollection(null);
      setFormData(emptyForm);
      setShowModal(true);
      return;
    }

    setEditingCollection(collection);
    setFormData({
      title: collection.title || '',
      handle: collection.handle || '',
      description: collection.description || '',
      image: collection.image || '',
      seo_title: collection.seo_title || '',
      seo_description: collection.seo_description || '',
      sort_order: collection.sort_order || 0,
      is_active: collection.is_active,
      product_ids: collection.product_ids || [],
    });
    setShowModal(true);
  };

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        handle: slugify(formData.handle || formData.title),
        description: formData.description,
        image: formData.image,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
        product_ids: formData.product_ids,
      };

      const url = editingCollection ? `/api/collections/${editingCollection.id}` : '/api/collections';
      const method = editingCollection ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to save collection');
        return;
      }

      setShowModal(false);
      setEditingCollection(null);
      setFormData(emptyForm);
      await fetchAll();
    } catch (error) {
      console.error('Failed:', error);
      alert('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;

    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        alert('Failed to delete collection');
        return;
      }

      await fetchAll();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-white">Collections</h1>
            <p className="mt-1 text-slate-400">{collections.length} collections</p>
          </div>
          <Button onClick={() => openModal()} icon={<PlusIcon className="h-5 w-5" />}>
            Add Collection
          </Button>
        </div>

        <Card>
          <div className="border-b border-white/5 p-4">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search collections..."
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : filteredCollections.length ? (
            <div className="divide-y divide-white/5">
              {filteredCollections.map((collection) => (
                <div key={collection.id} className="flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/[0.02]">
                      {collection.image ? (
                        <img src={collection.image} alt={collection.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{collection.title}</p>
                      <p className="text-sm text-slate-500">/{collection.handle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${collection.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {collection.is_active ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-sm text-slate-400">{collection.products_count || 0} products</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal(collection)} className="rounded-xl bg-white/[0.02] p-2.5 text-slate-400 transition-all hover:bg-white/5 hover:text-white">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(collection.id)} className="rounded-xl bg-white/[0.02] p-2.5 text-slate-400 transition-all hover:bg-red-500/20 hover:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">No collections found.</div>
          )}
        </Card>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#121826] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{editingCollection ? 'Edit Collection' : 'Add Collection'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm text-slate-300">Title</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: event.target.value,
                      handle: prev.handle || slugify(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-300">Handle / Slug</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.handle}
                  onChange={(event) => setFormData((prev) => ({ ...prev, handle: slugify(event.target.value) }))}
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Description</span>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              <div className="md:col-span-2">
                <MediaPickerField
                  theme="dark"
                  label="Cover Media"
                  value={formData.image}
                  onChange={(mediaUrl) => setFormData((prev) => ({ ...prev, image: mediaUrl }))}
                  mediaUrls={mediaUrls}
                  datalistId="collection-media-options"
                  helperText="Attach and upload file, or import URL. Save + Publish to push live."
                />
              </div>

              <label className="space-y-1">
                <span className="text-sm text-slate-300">SEO Title</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.seo_title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, seo_title: event.target.value }))}
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-300">Sort Order</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.sort_order}
                  onChange={(event) => setFormData((prev) => ({ ...prev, sort_order: Number(event.target.value || 0) }))}
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">SEO Description</span>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.seo_description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, seo_description: event.target.value }))}
                />
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-sm text-slate-300">Assigned Products</span>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={formData.product_ids.includes(product.id)}
                          onChange={() => handleProductToggle(product.id)}
                        />
                        <span>{product.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-200 md:col-span-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(event) => setFormData((prev) => ({ ...prev, is_active: event.target.checked }))}
                />
                Published
              </label>
            </div>

            <div className="mt-7 flex gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Collection'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
