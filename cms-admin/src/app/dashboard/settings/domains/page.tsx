'use client';

import { useState, useEffect } from 'react';
import { SaveIcon, GlobeIcon, ShieldCheckIcon, ExclamationCircleIcon } from '@heroicons/react/outline';

export default function DomainsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    primary_domain: '',
    domain_status: 'pending',
    ssl_enabled: true,
  });

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/settings/domains');
      const data = await res.json();
      setFormData({
        primary_domain: data.primary_domain || '',
        domain_status: data.domain_status || 'pending',
        ssl_enabled: data.ssl_enabled || false,
      });
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings/domains', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Failed to save domains:', error);
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Domain configured, awaiting DNS propagation' },
    { value: 'active', label: 'Active', description: 'Domain is live and accessible' },
    { value: 'error', label: 'Error', description: 'There is an issue with the domain configuration' },
  ];

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
          <h1 className="text-2xl font-bold text-slate-900">Domains</h1>
          <p className="text-slate-500 mt-1">Manage your store domain</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <GlobeIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-sm text-slate-500">Primary Domain</p>
              <p className="text-lg font-semibold text-slate-900">{formData.primary_domain || 'Not set'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            {formData.domain_status === 'active' ? (
              <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
            ) : formData.domain_status === 'error' ? (
              <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
            ) : (
              <ExclamationCircleIcon className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">{formData.domain_status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className={`w-8 h-8 ${formData.ssl_enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div>
              <p className="text-sm text-slate-500">SSL Certificate</p>
              <p className="text-lg font-semibold text-slate-900">{formData.ssl_enabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Domain Configuration</h2>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Primary Domain</label>
            <input
              type="text"
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.primary_domain}
              onChange={(e) => setFormData({ ...formData, primary_domain: e.target.value })}
              placeholder="hdmuscle.in"
            />
            <p className="text-xs text-slate-400 mt-1">Your primary store domain</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Domain Status</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, domain_status: status.value })}
                  className={`p-4 rounded-lg border text-left transition ${
                    formData.domain_status === status.value
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-slate-900">{status.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{status.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.ssl_enabled}
                onChange={(e) => setFormData({ ...formData, ssl_enabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Enable SSL (HTTPS)</span>
                <p className="text-xs text-slate-500">Automatically provisioned by Vercel</p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50"
          >
            <SaveIcon className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">DNS Configuration</h2>
        <p className="text-sm text-slate-600 mb-4">To use your custom domain, configure your DNS settings at your domain registrar:</p>
        
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Type</p>
              <p className="font-mono text-slate-900">CNAME</p>
            </div>
            <div>
              <p className="text-slate-500">Name</p>
              <p className="font-mono text-slate-900">@</p>
            </div>
            <div>
              <p className="text-slate-500">Value</p>
              <p className="font-mono text-slate-900">cname.vercel-dns.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}