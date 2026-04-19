'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, GlobeIcon } from '@heroicons/react/outline';

interface PublishButtonProps {
  onPublish?: () => void;
}

export default function PublishButton({ onPublish }: PublishButtonProps) {
  const [publishing, setPublishing] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/publish');
      const data = await res.json();
      if (data.published) {
        setLastPublished(new Date(data.published).toLocaleString());
      }
      setMessage(data.message || '');
    } catch {}
  };

  const handlePublish = async () => {
    if (!confirm('Publish all changes to make them live on the website?')) return;
    
    setPublishing(true);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Published successfully! All changes are now live on the storefront.');
        setLastPublished(new Date().toLocaleString());
        onPublish?.();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={publishing}
      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
      title={lastPublished ? `Last published: ${lastPublished}` : 'Publish changes'}
    >
      <SparklesIcon className="w-5 h-5" />
      {publishing ? 'Publishing...' : 'Publish Live'}
    </button>
  );
}