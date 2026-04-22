'use client';

import { useMemo, useRef, useState } from 'react';

type Feedback = {
  type: 'success' | 'error';
  message: string;
};

type MediaPickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  datalistId?: string;
  mediaUrls?: string[];
  accept?: string;
  helperText?: string;
  theme?: 'light' | 'dark';
};

function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(url) || url.startsWith('data:image/');
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|ogg)(\?|#|$)/i.test(url) || url.startsWith('data:video/');
}

export default function MediaPickerField({
  label,
  value,
  onChange,
  onSelect,
  placeholder = 'https://example.com/asset.jpg',
  datalistId,
  mediaUrls = [],
  accept = 'image/*,video/*',
  helperText,
  theme = 'dark',
}: MediaPickerFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const isDark = theme === 'dark';
  const inputClass = isDark
    ? 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-slate-500'
    : 'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400';
  const buttonSecondaryClass = isDark
    ? 'rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10'
    : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50';

  const previewUrl = useMemo(() => {
    if (attachedPreview) return attachedPreview;
    return value;
  }, [attachedPreview, value]);

  const setSuccess = (message: string) => setFeedback({ type: 'success', message });
  const setError = (message: string) => setFeedback({ type: 'error', message });

  const applyUrl = (url: string) => {
    if (onSelect) {
      onSelect(url);
      return;
    }
    onChange(url);
  };

  const handleAttachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    setAttachedFile(file);
    setAttachedPreview(URL.createObjectURL(file));
    setSuccess(`Media attached: ${file.name}`);
  };

  const handleUploadFile = async () => {
    if (!attachedFile) {
      setError('Attach a file first.');
      return;
    }

    setUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('file', attachedFile);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.url) {
        setError(payload?.error || 'Upload failed.');
        return;
      }

      const uploadedUrl = String(payload.url);
      applyUrl(uploadedUrl);
      setAttachedFile(null);
      setAttachedPreview('');
      setSuccess('Media uploaded successfully.');
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportUrl = async () => {
    const raw = value.trim();
    if (!raw) {
      setError('Enter a media URL first.');
      return;
    }

    setImporting(true);
    setFeedback(null);

    try {
      const filename = raw.split('/').pop() || `asset-${Date.now()}`;
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          url: raw,
          filename,
          mime_type: null,
          alt_text: '',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.error || 'Media URL import failed.');
        return;
      }

      applyUrl(raw);
      setSuccess('Media URL imported successfully.');
    } catch (error) {
      console.error('Import error:', error);
      setError('Media URL import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>

      <div className="space-y-2">
        <input
          type="url"
          list={datalistId}
          className={inputClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />

        <div className="flex flex-wrap gap-2">
          <label className={`${buttonSecondaryClass} cursor-pointer`}>
            Attach File
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleAttachFile}
            />
          </label>
          <button type="button" onClick={handleUploadFile} className={buttonSecondaryClass} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          <button type="button" onClick={handleImportUrl} className={buttonSecondaryClass} disabled={importing}>
            {importing ? 'Importing...' : 'Import URL'}
          </button>
        </div>

        {attachedFile ? (
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Attached media: {attachedFile.name}
          </p>
        ) : null}

        {feedback ? (
          <p className={`text-xs ${feedback.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>{feedback.message}</p>
        ) : null}

        {helperText ? <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{helperText}</p> : null}

        {previewUrl ? (
          <div className={`rounded-lg border p-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
            {isImage(previewUrl) ? (
              <img src={previewUrl} alt="Media preview" className="h-24 w-24 rounded object-cover" />
            ) : isVideo(previewUrl) ? (
              <video src={previewUrl} controls className="h-24 w-40 rounded bg-black object-cover" />
            ) : (
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Media attached</p>
            )}
          </div>
        ) : null}
      </div>

      {datalistId ? (
        <datalist id={datalistId}>
          {mediaUrls.map((url) => (
            <option key={url} value={url} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}
