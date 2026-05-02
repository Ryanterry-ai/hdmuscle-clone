import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';

interface SearchProduct {
  handle: string;
  title: string;
  brandName: string;
  salePrice: number;
  mainImage: string;
}

interface SearchBarProps {
  products: SearchProduct[];
}

export default function SearchBar({ products }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredProducts = debouncedQuery
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.brandName.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredProducts.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredProducts.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
            window.location.href = `/product/${filteredProducts[selectedIndex].handle}`;
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, filteredProducts, selectedIndex]
  );

  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands..."
          className="w-full pl-10 pr-10 py-2.5 border border-border-light rounded-full text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-text-muted hover:text-gray-900 transition-colors" />
          </button>
        )}
      </div>

      {isOpen && debouncedQuery && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border-light shadow-lg max-h-80 overflow-y-auto z-50"
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <Link
                key={product.handle}
                href={`/product/${product.handle}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-light-bg transition-colors ${
                  index === selectedIndex ? 'bg-light-bg' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className="w-10 h-10 rounded-lg bg-light-bg flex-shrink-0 overflow-hidden">
                  {product.mainImage && (
                    <img
                      src={product.mainImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {product.brandName} • ₹{product.salePrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
