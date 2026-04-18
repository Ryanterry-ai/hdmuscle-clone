'use client';

import { useState, useEffect } from 'react';
import { DownloadIcon, CheckCircleIcon, RefreshIcon, ArrowRightIcon } from '@heroicons/react/outline';

interface ImportResults {
  products: { imported: number; skipped: number };
  collections: { imported: number; skipped: number };
  pages: { imported: number; skipped: number };
  sections: { imported: number; skipped: number };
  navigation: { imported: number; skipped: number };
  seo: { imported: number; skipped: number };
  productCollections: { linked: number };
  errors: string[];
}

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [stats, setStats] = useState({ products: 0, collections: 0, pages: 0, sections: 0, navigation: 0, seo: 0, productCollections: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/import-all');
      const data = await res.json();
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch('/api/import-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setResults(data.results);
      fetchStats();
    } catch (error: any) {
      console.error('Import failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalImported = results 
    ? results.products.imported + results.collections.imported + results.pages.imported + 
      results.sections.imported + results.navigation.imported + results.seo.imported + results.productCollections.linked
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import Content</h1>
        <p className="text-slate-500 mt-1">Import all data from hdmuscle.in into your CMS</p>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-2xl">📦</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.products}</p>
          <p className="text-xs text-slate-500">Products</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-2xl">🔗</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.productCollections}</p>
          <p className="text-xs text-slate-500">Product→Collection</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-2xl">📂</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.collections}</p>
          <p className="text-xs text-slate-500">Collections</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-2xl">📄</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pages}</p>
          <p className="text-xs text-slate-500">Pages</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-2xl">🎨</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.sections}</p>
          <p className="text-xs text-slate-500">Sections</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-2xl">🔗</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.navigation}</p>
          <p className="text-xs text-slate-500">Navigation</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-2xl">🔍</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.seo}</p>
          <p className="text-xs text-slate-500">SEO</p>
        </div>
      </div>

      {/* Import Button */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Import All Content</h2>
            <p className="text-sm text-slate-500 mt-1">
              Imports products, collections with products linked, pages, homepage sections, navigation menu, and SEO
            </p>
          </div>
          <button
            onClick={handleImport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshIcon className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <DownloadIcon className="w-5 h-5" />
                Import Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
            <h2 className="font-semibold text-slate-900">Import Complete</h2>
            <span className="text-2xl font-bold text-indigo-600 ml-2">{totalImported}</span>
            <span className="text-slate-500">items imported</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">Products</p>
              <p className="text-lg font-bold text-emerald-600">+{results.products.imported}</p>
              <p className="text-xs text-slate-400">({results.products.skipped} existing)</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">Collections</p>
              <p className="text-lg font-bold text-emerald-600">+{results.collections.imported}</p>
              <p className="text-xs text-slate-400">({results.collections.skipped} existing)</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">Product→Collection Links</p>
              <p className="text-lg font-bold text-emerald-600">+{results.productCollections.linked}</p>
              <p className="text-xs text-slate-400">products linked</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">Pages</p>
              <p className="text-lg font-bold text-emerald-600">+{results.pages.imported}</p>
              <p className="text-xs text-slate-400">({results.pages.skipped} existing)</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">Sections</p>
              <p className="text-lg font-bold text-emerald-600">+{results.sections.imported}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">Navigation</p>
              <p className="text-lg font-bold text-emerald-600">+{results.navigation.imported}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">SEO</p>
              <p className="text-lg font-bold text-emerald-600">+{results.seo.imported}</p>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Errors: {results.errors.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Manage Imported Content</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <a href="/dashboard/products" className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
            <span>📦</span>
            <span className="text-sm font-medium">Products</span>
            <ArrowRightIcon className="w-4 h-4 ml-auto" />
          </a>
          <a href="/dashboard/collections" className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
            <span>📂</span>
            <span className="text-sm font-medium">Collections</span>
            <ArrowRightIcon className="w-4 h-4 ml-auto" />
          </a>
          <a href="/dashboard/content/pages" className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
            <span>📄</span>
            <span className="text-sm font-medium">Pages</span>
            <ArrowRightIcon className="w-4 h-4 ml-auto" />
          </a>
          <a href="/dashboard/content/homepage" className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
            <span>🎨</span>
            <span className="text-sm font-medium">Homepage</span>
            <ArrowRightIcon className="w-4 h-4 ml-auto" />
          </a>
          <a href="/dashboard/content/navigation" className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
            <span>🔗</span>
            <span className="text-sm font-medium">Navigation</span>
            <ArrowRightIcon className="w-4 h-4 ml-auto" />
          </a>
          <a href="/dashboard/content/seo" className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
            <span>🔍</span>
            <span className="text-sm font-medium">SEO</span>
            <ArrowRightIcon className="w-4 h-4 ml-auto" />
          </a>
        </div>
      </div>
    </div>
  );
}