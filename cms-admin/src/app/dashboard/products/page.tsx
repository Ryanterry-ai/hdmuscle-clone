'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from '@heroicons/react/outline';
import MediaPickerField from '@/components/MediaPickerField';

type Collection = {
  id: string;
  title: string;
  handle: string;
};

type CategoryItem = {
  name: string;
  product_count: number;
};

type ProductImage = {
  id?: string;
  url: string;
};

type ProductCollectionRelation = {
  collection_id?: string;
  collection?: { id: string; title: string; handle: string };
};

type Product = {
  id: string;
  title: string;
  handle: string;
  short_description: string | null;
  description: string | null;
  badge: string | null;
  category: string | null;
  tags: string | null;
  flavor_options: string | null;
  size_options: string | null;
  price: string;
  compare_at_price: string | null;
  sku: string | null;
  inventory: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  images: ProductImage[];
  collections: ProductCollectionRelation[];
};

type ProductFormState = {
  title: string;
  handle: string;
  short_description: string;
  description: string;
  badge: string;
  category: string;
  tags: string;
  flavor_options: string;
  size_options: string;
  price: string;
  compare_at_price: string;
  sku: string;
  inventory: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  featured_image: string;
  gallery_images: string;
  collection_ids: string[];
};

const emptyForm: ProductFormState = {
  title: '',
  handle: '',
  short_description: '',
  description: '',
  badge: '',
  category: '',
  tags: '',
  flavor_options: '',
  size_options: '',
  price: '',
  compare_at_price: '',
  sku: '',
  inventory: 0,
  is_active: true,
  is_featured: false,
  seo_title: '',
  seo_description: '',
  featured_image: '',
  gallery_images: '',
  collection_ids: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseLineList(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductFormState>(emptyForm);
  const [galleryAttachUrl, setGalleryAttachUrl] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [productsRes, collectionsRes, categoriesRes, mediaRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/collections', { credentials: 'include' }),
        fetch('/api/categories', { credentials: 'include' }),
        fetch('/api/media', { credentials: 'include' }),
      ]);

      const productsData = await productsRes.json();
      const collectionsData = await collectionsRes.json();
      const categoriesData = await categoriesRes.json();
      const mediaData = await mediaRes.json();

      setProducts(productsData.products || []);
      setCollections(collectionsData.collections || []);
      setCategories(categoriesData.categories || []);
      setMediaUrls((mediaData.media || []).map((item: any) => String(item.url || '')).filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) =>
      [product.title, product.handle, product.category || '', product.sku || '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [products, search]);

  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const openModal = (product?: Product) => {
    if (!product) {
      setEditingProduct(null);
      setFormData(emptyForm);
      setGalleryAttachUrl('');
      setShowModal(true);
      return;
    }

    const imageUrls = (product.images || []).map((image) => image.url).filter(Boolean);
    const featured = imageUrls[0] || '';
    const gallery = imageUrls.slice(1).join('\n');

    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      handle: product.handle || '',
      short_description: product.short_description || '',
      description: product.description || '',
      badge: product.badge || '',
      category: product.category || '',
      tags: product.tags || '',
      flavor_options: product.flavor_options || '',
      size_options: product.size_options || '',
      price: String(product.price || ''),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : '',
      sku: product.sku || '',
      inventory: product.inventory || 0,
      is_active: product.is_active,
      is_featured: product.is_featured,
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      featured_image: featured,
      gallery_images: gallery,
      collection_ids: (product.collections || [])
        .map((relation) => relation.collection?.id || relation.collection_id)
        .filter(Boolean) as string[],
    });
    setGalleryAttachUrl('');
    setShowModal(true);
  };

  const handleCollectionToggle = (collectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      collection_ids: prev.collection_ids.includes(collectionId)
        ? prev.collection_ids.filter((id) => id !== collectionId)
        : [...prev.collection_ids, collectionId],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const galleryUrls = parseLineList(formData.gallery_images);

      const payload = {
        title: formData.title,
        handle: slugify(formData.handle || formData.title),
        short_description: formData.short_description,
        description: formData.description,
        badge: formData.badge,
        category: formData.category,
        tags: formData.tags,
        flavor_options: formData.flavor_options,
        size_options: formData.size_options,
        price: formData.price,
        compare_at_price: formData.compare_at_price,
        sku: formData.sku,
        inventory: formData.inventory,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        featured_image: formData.featured_image,
        images: [formData.featured_image, ...galleryUrls].filter(Boolean),
        collection_ids: formData.collection_ids,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to save product');
        return;
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData(emptyForm);
      setGalleryAttachUrl('');
      await fetchAll();
    } catch (error) {
      console.error('Failed:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        alert('Failed to delete product');
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
            <h1 className="page-title text-white">Products</h1>
            <p className="mt-1 text-slate-400">{products.length} products in catalog</p>
          </div>
          <Button onClick={() => openModal()} icon={<PlusIcon className="h-5 w-5" />}>
            Add Product
          </Button>
        </div>

        <Card>
          <div className="border-b border-white/5 p-4">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search products..."
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
          ) : filteredProducts.length ? (
            <div className="divide-y divide-white/5">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/[0.02]">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{product.title}</p>
                      <p className="text-sm text-slate-500">/{product.handle}</p>
                      <p className="text-xs text-slate-500">{product.category || 'Uncategorized'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${product.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {product.is_active ? 'Published' : 'Draft'}
                    </span>
                    <span className="w-24 text-right font-semibold text-white">{formatCurrency(product.price)}</span>
                    <span className="w-20 text-right text-sm text-slate-400">Stock: {product.inventory}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal(product)} className="rounded-xl bg-white/[0.02] p-2.5 text-slate-400 transition-all hover:bg-white/5 hover:text-white">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="rounded-xl bg-white/[0.02] p-2.5 text-slate-400 transition-all hover:bg-red-500/20 hover:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">No products found.</div>
          )}
        </Card>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#121826] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
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

              <label className="space-y-1">
                <span className="text-sm text-slate-300">Price (INR)</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.price}
                  onChange={(event) => setFormData((prev) => ({ ...prev, price: event.target.value }))}
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-300">Compare Price (INR)</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.compare_at_price}
                  onChange={(event) => setFormData((prev) => ({ ...prev, compare_at_price: event.target.value }))}
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-300">Inventory</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.inventory}
                  onChange={(event) => setFormData((prev) => ({ ...prev, inventory: Number(event.target.value || 0) }))}
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-300">SKU</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.sku}
                  onChange={(event) => setFormData((prev) => ({ ...prev, sku: event.target.value }))}
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-300">Category</span>
                <input
                  list="product-category-options"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.category}
                  onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
                />
                <a className="text-xs text-slate-400 underline hover:text-white" href="/dashboard/categories">
                  Manage categories
                </a>
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-300">Badge / Label</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.badge}
                  onChange={(event) => setFormData((prev) => ({ ...prev, badge: event.target.value }))}
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Tags (comma-separated)</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.tags}
                  onChange={(event) => setFormData((prev) => ({ ...prev, tags: event.target.value }))}
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Flavor Options (comma-separated)</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  placeholder="Unflavored, Sour Gummies, Blue Raspberry"
                  value={formData.flavor_options}
                  onChange={(event) => setFormData((prev) => ({ ...prev, flavor_options: event.target.value }))}
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Size Options (comma-separated)</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  placeholder="30 Servings, 60 Servings"
                  value={formData.size_options}
                  onChange={(event) => setFormData((prev) => ({ ...prev, size_options: event.target.value }))}
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Short Description</span>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.short_description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, short_description: event.target.value }))}
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Description</span>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              {editingProduct ? (
                <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Current Featured Media</p>
                  {formData.featured_image ? (
                    <div className="flex items-center gap-3">
                      <img src={formData.featured_image} alt={formData.title || 'Current media'} className="h-16 w-16 rounded object-cover border border-white/10" />
                      <p className="text-xs text-slate-400 break-all">{formData.featured_image}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No featured media currently assigned.</p>
                  )}
                </div>
              ) : null}

              <div className="md:col-span-2">
                <MediaPickerField
                  theme="dark"
                  label="Featured Media"
                  value={formData.featured_image}
                  onChange={(mediaUrl) => setFormData((prev) => ({ ...prev, featured_image: mediaUrl }))}
                  mediaUrls={mediaUrls}
                  datalistId="product-media-featured"
                  helperText="Attach file, upload, or import URL. Success message appears after upload/import."
                />
              </div>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Gallery Image URLs (one per line)</span>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.gallery_images}
                  onChange={(event) => setFormData((prev) => ({ ...prev, gallery_images: event.target.value }))}
                />
                <p className="text-xs text-slate-500">One URL per line. Use quick attach below to add media without manual copy/paste.</p>
              </label>

              <div className="md:col-span-2">
                <MediaPickerField
                  theme="dark"
                  label="Add Gallery Media"
                  value={galleryAttachUrl}
                  onChange={setGalleryAttachUrl}
                  onSelect={(mediaUrl) => {
                    setFormData((prev) => {
                      const merged = Array.from(new Set([...parseLineList(prev.gallery_images), mediaUrl]));
                      return { ...prev, gallery_images: merged.join('\n') };
                    });
                    setGalleryAttachUrl('');
                  }}
                  mediaUrls={mediaUrls}
                  datalistId="product-media-gallery"
                  helperText="Uploaded/imported media will be appended to the gallery list automatically."
                />
              </div>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">SEO Title</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                  value={formData.seo_title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, seo_title: event.target.value }))}
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
                <span className="text-sm text-slate-300">Assigned Collections</span>
                <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-2">
                  {collections.map((collection) => (
                    <label key={collection.id} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={formData.collection_ids.includes(collection.id)}
                        onChange={() => handleCollectionToggle(collection.id)}
                      />
                      <span>{collection.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-5 md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(event) => setFormData((prev) => ({ ...prev, is_active: event.target.checked }))}
                  />
                  Published
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(event) => setFormData((prev) => ({ ...prev, is_featured: event.target.checked }))}
                  />
                  Featured
                </label>
              </div>
            </div>

            <datalist id="product-category-options">
              {categories.map((category) => (
                <option key={category.name} value={category.name} />
              ))}
            </datalist>

            <div className="mt-7 flex gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
