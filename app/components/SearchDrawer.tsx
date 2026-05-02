'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SearchDrawerProps {
  open: boolean;
  onClose: () => void;
  suggestions?: { title?: string; label?: string; link?: string; url?: string }[];
}

export default function SearchDrawer({ open, onClose, suggestions = [] }: SearchDrawerProps) {
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setIsVisible(true));
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      setIsVisible(false);
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 left-0 right-0 bg-white shadow-xl transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container-wide py-6">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands, categories..."
              className="w-full pl-12 pr-12 py-4 text-lg border-b-2 border-gray-200 focus:border-primary outline-none transition-colors"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </form>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item, index) => (
                  <Link
                    key={`${item.title || item.label}-${index}`}
                    href={item.link || item.url || '#'}
                    className="px-4 py-2 bg-gray-100 text-sm text-gray-700 rounded-full hover:bg-primary hover:text-dark-bg transition-colors"
                    onClick={onClose}
                  >
                    {item.title || item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
