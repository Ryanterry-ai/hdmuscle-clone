'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/outline';

interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  products_count: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
          <p className="text-slate-500 mt-1">{collections.length} collections in your store</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
          <PlusIcon className="w-5 h-5" />
          Add Collection
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search collections..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredCollections.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                    {collection.image ? (
                      <img src={collection.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📁</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{collection.title}</p>
                    <p className="text-sm text-slate-500">/{collection.handle}</p>
                    {collection.description && (
                      <p className="text-sm text-slate-400 mt-1 truncate max-w-md">{collection.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{collection.products_count} products</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    collection.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {collection.is_active ? 'Active' : 'Draft'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No collections found</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
              <PlusIcon className="w-5 h-5" />
              Create your first collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
