'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, XIcon, UploadIcon } from '@heroicons/react/outline';

interface Product {
  id: string;
  title: string;
  handle: string;
  price: string;
  description: string;
  inventory: number;
  is_active: boolean;
  images: { url: string }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', handle: '', price: '', description: '', inventory: 100, is_active: true
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount));
  };

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.handle?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ title: product.title, handle: product.handle, price: product.price, description: product.description || '', inventory: product.inventory, is_active: product.is_active });
    } else {
      setEditingProduct(null);
      setFormData({ title: '', handle: '', price: '', description: '', inventory: 100, is_active: true });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
      
      // Check if response is OK before parsing JSON
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Save failed:', res.status, errorText);
        alert(`Failed to save: ${res.status}`);
        return;
      }
      
      const data = await res.json();
      setShowModal(false);
      fetchProducts();
    } catch (error) { 
      console.error('Failed:', error); 
      alert('Failed to save product');
    } 
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-white">Products</h1>
            <p className="text-slate-400 mt-1">{products.length} products in your store</p>
          </div>
          <Button onClick={() => openModal()} icon={<PlusIcon className="w-5 h-5" />}>
            Add Product
          </Button>
        </div>

        <Card>
          <div className="p-4 border-b border-white/5">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/[0.02] flex items-center justify-center overflow-hidden">
                      {product.images[0]?.url ? (
                        <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">💪</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{product.title}</p>
                      <p className="text-sm text-slate-500">/{product.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${product.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                    <span className="text-slate-400 text-sm">{product.inventory} in stock</span>
                    <span className="font-semibold text-white w-24 text-right">{formatCurrency(product.price)}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal(product)} className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <p>No products found</p>
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg nm-flat rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <Input label="Product Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value, handle: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
              <Input label="URL Handle" value={formData.handle} onChange={(e) => setFormData({...formData, handle: e.target.value})} />
              <Input label="Price (INR)" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              <Input label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              <Input label="Inventory" type="number" value={formData.inventory} onChange={(e) => setFormData({...formData, inventory: Number(e.target.value)})} />
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-300">Active</span>
                <Toggle checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">{saving ? 'Saving...' : 'Save Product'}</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}