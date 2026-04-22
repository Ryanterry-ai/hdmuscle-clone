'use client';

import { useState, useEffect } from 'react';
import { SearchIcon, EyeIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/outline';

interface FormSubmission {
  id: string;
  form_id: string;
  email: string | null;
  data: string;
  source: string | null;
  status: string;
  created_at: string;
}

export default function FormsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/forms');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return;
    try {
      await fetch(`/api/forms?id=${id}`, { method: 'DELETE' });
      fetchSubmissions();
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.form_id.toLowerCase().includes(search.toLowerCase())
  );

  const parseData = (dataStr: string) => {
    try {
      return JSON.parse(dataStr);
    } catch {
      return dataStr;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Form Submissions</h1>
          <p className="text-slate-500 mt-1">{submissions.length} submissions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Form</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <DocumentTextIcon className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="font-medium text-slate-900 capitalize">{sub.form_id.replace(/-/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sub.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        sub.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 
                        sub.status === 'READ' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedSubmission(sub)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(sub.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500">No form submissions yet</p>
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 capitalize">{selectedSubmission.form_id.replace(/-/g, ' ')}</h2>
                <p className="text-sm text-slate-500">{new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(parseData(selectedSubmission.data)).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-500 capitalize">{key.replace(/_/g, ' ')}</label>
                    <p className="text-slate-900 mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}