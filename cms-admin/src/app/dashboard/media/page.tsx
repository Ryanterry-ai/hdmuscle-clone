'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, TrashIcon, EyeIcon } from '@heroicons/react/outline';

interface Media {
  id: string;
  url: string;
  filename: string;
  mime_type: string | null;
  size: number | null;
  alt_text: string | null;
  created_at: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredMedia = media.filter(m => 
    m.filename.toLowerCase().includes(search.toLowerCase()) ||
    (m.alt_text && m.alt_text.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
          <p className="text-slate-500 mt-1">{media.length} files</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
          <PlusIcon className="w-5 h-5" />
          Upload Files
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((file) => (
            <div key={file.id} className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                {file.mime_type?.startsWith('image/') ? (
                  <img src={file.url} alt={file.alt_text || file.filename} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📄</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-slate-900 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button className="p-1.5 bg-white rounded-lg shadow-md hover:bg-slate-50">
                  <EyeIcon className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50">
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-4">No files uploaded yet</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">
            <PlusIcon className="w-5 h-5" />
            Upload your first file
          </button>
        </div>
      )}
    </div>
  );
}
