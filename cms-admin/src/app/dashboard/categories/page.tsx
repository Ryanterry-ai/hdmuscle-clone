'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PencilIcon, PlusIcon, TrashIcon, XIcon } from '@heroicons/react/outline';

type CategoryItem = {
  name: string;
  product_count: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/categories', { credentials: 'include' });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function createCategory() {
    const name = newCategory.trim();
    if (!name) return;

    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        alert('Failed to create category');
        return;
      }

      setNewCategory('');
      await fetchCategories();
    } finally {
      setSaving(false);
    }
  }

  async function renameCategory(oldName: string) {
    const nextValue = editingValue.trim();
    if (!nextValue || nextValue === oldName) {
      setEditingName(null);
      setEditingValue('');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ old_name: oldName, new_name: nextValue }),
      });

      if (!res.ok) {
        alert('Failed to rename category');
        return;
      }

      setEditingName(null);
      setEditingValue('');
      await fetchCategories();
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(name: string) {
    if (!confirm(`Delete category "${name}" from category list?`)) return;

    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, clear_products: false }),
      });

      if (!res.ok) {
        alert('Failed to delete category');
        return;
      }

      await fetchCategories();
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-white">Categories</h1>
            <p className="mt-1 text-slate-400">Manage product taxonomy labels used in product forms.</p>
          </div>
        </div>

        <Card>
          <div className="border-b border-white/5 p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white"
                placeholder="New category name"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
              />
              <Button onClick={createCategory} loading={saving} icon={<PlusIcon className="h-5 w-5" />}>
                Add Category
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : categories.length ? (
            <div className="divide-y divide-white/5">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-4">
                  <div>
                    {editingName === category.name ? (
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                        value={editingValue}
                        onChange={(event) => setEditingValue(event.target.value)}
                      />
                    ) : (
                      <p className="font-semibold text-white">{category.name}</p>
                    )}
                    <p className="text-sm text-slate-500">{category.product_count} products</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingName === category.name ? (
                      <>
                        <Button onClick={() => renameCategory(category.name)} loading={saving}>
                          Save
                        </Button>
                        <button
                          onClick={() => {
                            setEditingName(null);
                            setEditingValue('');
                          }}
                          className="rounded-xl bg-white/[0.02] p-2.5 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingName(category.name);
                            setEditingValue(category.name);
                          }}
                          className="rounded-xl bg-white/[0.02] p-2.5 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.name)}
                          className="rounded-xl bg-white/[0.02] p-2.5 text-slate-400 transition-all hover:bg-red-500/20 hover:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">No categories added yet.</div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

