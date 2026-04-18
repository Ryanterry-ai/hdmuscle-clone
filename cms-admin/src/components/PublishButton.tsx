'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/outline';

interface PublishButtonProps {
  onPublish?: () => void;
}

export default function PublishButton({ onPublish }: PublishButtonProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);

  useEffect(() => {
    checkChanges();
  }, []);

  const checkChanges = async () => {
    try {
      const res = await fetch('/api/publish');
      const data = await res.json();
      setHasChanges(data.hasChanges || false);
      setLastPublished(data.lastPublished);
    } catch {}
  };

  const handlePublish = async () => {
    if (!confirm('Publish changes to make them live on the website?')) return;
    
    setPublishing(true);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Published successfully!');
        setHasChanges(false);
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

  if (!hasChanges) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 font-medium rounded-xl cursor-not-allowed"
      >
        <SparklesIcon className="w-5 h-5" />
        Live
      </button>
    );
  }

  return (
    <button
      onClick={handlePublish}
      disabled={publishing}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
    >
      <SparklesIcon className="w-5 h-5" />
      {publishing ? 'Publishing...' : 'Publish Changes'}
    </button>
  );
}