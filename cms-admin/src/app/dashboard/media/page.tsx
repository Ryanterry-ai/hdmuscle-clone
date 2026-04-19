'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PlusIcon, SearchIcon, TrashIcon, EyeIcon, XIcon } from '@heroicons/react/outline';

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
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;
    setUploading(true);
    
    for (const file of uploadedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
        if (!res.ok) console.error('Failed to upload:', file.name);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    setUploading(false);
    setUploadedFiles([]);
    setPreviews([]);
    fetchMedia();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-white">Media Library</h1>
            <p className="text-slate-400 mt-1">{media.length} files</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} icon={<PlusIcon className="w-5 h-5" />}>
            Upload Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <Card>
          <div className="p-4 border-b border-white/5">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search files..."
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
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
              {filteredMedia.map((file) => (
                <div key={file.id} className="group relative bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden hover:border-purple-500/50 transition-all">
                  <div className="aspect-square bg-white/[0.02] flex items-center justify-center overflow-hidden">
                    {file.mime_type?.startsWith('image/') ? (
                      <img src={file.url} alt={file.alt_text || file.filename} className="w-full h-full object-cover" />
                    ) : file.mime_type?.startsWith('video/') ? (
                      <video src={file.url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">📄</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700">
                      <EyeIcon className="w-4 h-4 text-slate-300" />
                    </button>
                    <button className="p-1.5 bg-slate-800 rounded-lg hover:bg-red-500/20">
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <p>No files uploaded yet</p>
            </div>
          )}
        </Card>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg nm-flat rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upload Files</h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
                  {previews[i] && (
                    <img src={previews[i]} alt={file.name} className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setUploadedFiles([]); setPreviews([]); fileInputRef.current?.click(); }} className="flex-1">
                Add More
              </Button>
              <Button variant="secondary" onClick={() => { setUploadedFiles([]); setPreviews([]); }} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpload} loading={uploading} className="flex-1">
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}