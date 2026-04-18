'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/outline';

interface NavLink {
  label: string;
  url: string;
  children?: NavLink[];
}

interface Navigation {
  id: string;
  location: string;
  title: string;
  links: string;
  is_active: boolean;
}

const locations = [
  { value: 'header', label: 'Header Navigation', description: 'Main menu at the top of the page' },
  { value: 'footer', label: 'Footer Navigation', description: 'Links shown in the footer' },
  { value: 'mobile', label: 'Mobile Navigation', description: 'Mobile menu drawer' },
];

export default function NavigationPage() {
  const [navigations, setNavigations] = useState<Navigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('header');
  const [formData, setFormData] = useState({ title: '', links: '[]', is_active: true });

  useEffect(() => {
    fetchNavigations();
  }, []);

  const fetchNavigations = async () => {
    try {
      const res = await fetch('/api/navigation');
      const data = await res.json();
      setNavigations(data.navigations || []);
      
      const nav = data.navigations?.find((n: Navigation) => n.location === selectedLocation);
      if (nav) {
        setFormData({
          title: nav.title || '',
          links: nav.links || '[]',
          is_active: nav.is_active,
        });
      } else {
        setFormData({ title: '', links: '[]', is_active: true });
      }
    } catch (error) {
      console.error('Failed to fetch navigations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nav = navigations.find(n => n.location === selectedLocation);
    if (nav) {
      setFormData({
        title: nav.title || '',
        links: nav.links || '[]',
        is_active: nav.is_active,
      });
    } else {
      setFormData({ title: '', links: '[]', is_active: true });
    }
  }, [selectedLocation, navigations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedLocation,
          title: formData.title,
          links: formData.links,
          is_active: formData.is_active,
        }),
      });
      fetchNavigations();
    } catch (error) {
      console.error('Failed to save navigation:', error);
    }
  };

  const parsedLinks: NavLink[] = JSON.parse(formData.links || '[]');

  const addLink = () => {
    const newLinks = [...parsedLinks, { label: '', url: '/', children: [] }];
    setFormData({ ...formData, links: JSON.stringify(newLinks) });
  };

  const updateLink = (index: number, updates: Partial<NavLink>) => {
    const newLinks = [...parsedLinks];
    newLinks[index] = { ...newLinks[index], ...updates };
    setFormData({ ...formData, links: JSON.stringify(newLinks) });
  };

  const removeLink = (index: number) => {
    const newLinks = parsedLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, links: JSON.stringify(newLinks) });
  };

  const addChildLink = (parentIndex: number) => {
    const newLinks = [...parsedLinks];
    if (!newLinks[parentIndex].children) newLinks[parentIndex].children = [];
    newLinks[parentIndex].children!.push({ label: '', url: '/' });
    setFormData({ ...formData, links: JSON.stringify(newLinks) });
  };

  const updateChildLink = (parentIndex: number, childIndex: number, updates: Partial<NavLink>) => {
    const newLinks = [...parsedLinks];
    if (newLinks[parentIndex].children) {
      newLinks[parentIndex].children![childIndex] = { ...newLinks[parentIndex].children![childIndex], ...updates };
    }
    setFormData({ ...formData, links: JSON.stringify(newLinks) });
  };

  const removeChildLink = (parentIndex: number, childIndex: number) => {
    const newLinks = [...parsedLinks];
    newLinks[parentIndex].children = newLinks[parentIndex].children?.filter((_, i) => i !== childIndex);
    setFormData({ ...formData, links: JSON.stringify(newLinks) });
  };

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
        <h1 className="text-2xl font-bold text-slate-900">Navigation</h1>
        <p className="text-slate-500 mt-1">Manage your site navigation menus</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Navigation Locations</h3>
          {locations.map(loc => (
            <button
              key={loc.value}
              onClick={() => setSelectedLocation(loc.value)}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selectedLocation === loc.value
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="font-medium text-slate-900">{loc.label}</p>
              <p className="text-sm text-slate-500 mt-1">{loc.description}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {locations.find(l => l.value === selectedLocation)?.label}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {navigations.find(n => n.location === selectedLocation) 
                      ? 'Edit existing navigation' 
                      : 'Create new navigation'}
                  </p>
                </div>
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
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Menu Title (optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Shop, More"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-slate-700">Menu Links</label>
                  <button
                    type="button"
                    onClick={addLink}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Link
                  </button>
                </div>

                <div className="space-y-3">
                  {parsedLinks.map((link, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="pt-2.5 text-slate-400 cursor-move">
                          ⋮⋮
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Label"
                              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              value={link.label}
                              onChange={(e) => updateLink(index, { label: e.target.value })}
                            />
                            <input
                              type="text"
                              placeholder="URL"
                              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              value={link.url}
                              onChange={(e) => updateLink(index, { url: e.target.value })}
                            />
                          </div>

                          {link.children && link.children.length > 0 && (
                            <div className="pl-4 border-l-2 border-slate-200 space-y-2 mt-3">
                              <p className="text-xs font-medium text-slate-500 uppercase">Dropdown Items</p>
                              {link.children.map((child, childIndex) => (
                                <div key={childIndex} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Label"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={child.label}
                                    onChange={(e) => updateChildLink(index, childIndex, { label: e.target.value })}
                                  />
                                  <input
                                    type="text"
                                    placeholder="URL"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={child.url}
                                    onChange={(e) => updateChildLink(index, childIndex, { url: e.target.value })}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeChildLink(index, childIndex)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => addChildLink(index)}
                              className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                              + Add dropdown item
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => removeLink(index)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Remove link
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {parsedLinks.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-slate-500 mb-4">No links added yet</p>
                      <button
                        type="button"
                        onClick={addLink}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Add first link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
              >
                Save Navigation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}