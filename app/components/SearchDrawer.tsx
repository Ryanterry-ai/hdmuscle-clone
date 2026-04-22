'use client';

import Link from 'next/link';

type Suggestion = {
  title?: string;
  label?: string;
  link?: string;
  url?: string;
};

export default function SearchDrawer({
  open,
  onClose,
  suggestions,
}: {
  open: boolean;
  onClose: () => void;
  suggestions: Suggestion[];
}) {
  if (!open) return null;

  return (
    <div className="search-drawer" onClick={onClose}>
      <div className="search-drawer__panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-drawer__header">
          <div className="search-drawer__title">Search</div>
          <button className="search-drawer__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <input className="search-drawer__input" placeholder="Search products..." />

        <div className="search-drawer__label">Suggested Searches</div>
        <div className="search-drawer__list">
          {suggestions.map((item, index) => (
            <Link
              key={`${item.label || item.title}-${index}`}
              href={item.url || item.link || '#'}
              className="search-drawer__link"
              onClick={onClose}
            >
              {item.label || item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
