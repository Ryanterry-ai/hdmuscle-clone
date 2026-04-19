'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { PlusIcon, PencilIcon, TrashIcon, XIcon, SearchIcon } from '@heroicons/react/outline';

interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  products_count?: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', handle: '', description: '', is_active: true });

  useEffect(() => { fetchCollections(); }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) || 
    c.handle?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({ title: collection.title, handle: collection.handle, description: collection.description || '', is_active: collection.is_active });
    } else {
      setEditingCollection(null);
      setFormData({ title: '', handle: '', description: '', is_active: true });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingCollection ? `/api/collections/${editingCollection.id}` : '/api/collections';
      const method = editingCollection ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setShowModal(false); fetchCollections(); }
    } catch (error) { console.error('Failed:', error); } 
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    fetchCollections();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-white">Collections</h1>
            <p className="text-slate-400 mt-1">{collections.length} collections</p>
          </div>
          <Button onClick={() => openModal()} icon={<PlusIcon className="w-5 h-5" />}>
            Add Collection
          </Button>
        </div>

        <Card>
          <div className="p-4 border-b border-white/5">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search collections..."
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
          ) : filteredCollections.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredCollections.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/[0.02] flex items-center justify-center overflow-hidden">
                      {c.image ? (
                        <img src={c.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📁</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{c.title}</p>
                      <p className="text-sm text-slate-500">/{c.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${c.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {c.is_active ? 'Active' : 'Draft'}
                    </span>
                    <span className="text-slate-400 text-sm">{c.products_count || 0} products</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal(c)} className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <p>No collections found</p>
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg nm-flat rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">{editingCollection ? 'Edit Collection' : 'Add New Collection'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <Input label="Collection Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value, handle: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
              <Input label="URL Handle" value={formData.handle} onChange={(e) => setFormData({...formData, handle: e.target.value})} />
              <Input label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-300">Active</span>
                <Toggle checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">{saving ? 'Saving...' : 'Save Collection'}</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}