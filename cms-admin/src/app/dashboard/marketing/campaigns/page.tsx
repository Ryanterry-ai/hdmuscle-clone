'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MailIcon } from '@heroicons/react/outline';

interface Campaign {
  id: string;
  name: string;
  subject: string | null;
  content: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setEditingCampaign(null);
      setFormData({ name: '', subject: '', content: '', status: 'DRAFT' });
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await fetch(`/api/campaigns?id=${id}`, { method: 'DELETE' });
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const openEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject || '',
      content: campaign.content || '',
      status: campaign.status,
    });
    setShowModal(true);
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    SENT: 'bg-emerald-100 text-emerald-700',
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
          <h1 className="text-2xl font-bold text-slate-900">Email Campaigns</h1>
          <p className="text-slate-500 mt-1">{campaigns.length} campaigns</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl">
          <PlusIcon className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <MailIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[campaign.status] || statusColors.DRAFT}`}>
                {campaign.status}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{campaign.subject || 'No subject'}</p>
            <p className="text-xs text-slate-400 mt-3">
              {campaign.sent_at ? `Sent ${new Date(campaign.sent_at).toLocaleDateString()}` : `Created ${new Date(campaign.created_at).toLocaleDateString()}`}
            </p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <button onClick={() => openEdit(campaign)} className="flex-1 flex items-center justify-center gap-2 p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => handleDelete(campaign.id)} className="flex-1 flex items-center justify-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 mb-4">No campaigns yet</p>
              <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
                <PlusIcon className="w-5 h-5" />
                Create your first campaign
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Create Campaign</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your email content here..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}