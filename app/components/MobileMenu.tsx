'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronRight, Search, ShoppingBag, User } from 'lucide-react';
import { Category, Brand, GoalWithProducts } from '../lib/data/types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  brands: Brand[];
  goals: GoalWithProducts[];
  navItems: { title: string; href: string }[];
  itemCount: number;
}

export default function MobileMenu({
  isOpen,
  onClose,
  categories,
  brands,
  goals,
  navItems,
  itemCount,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      document.body.style.overflow = '';
      setIsVisible(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen) return null;

  const categoryGroups = categories.reduce((acc, cat) => {
    const group = cat.menu_group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-bold text-gray-900">Menu</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b">
            <Link
              href="/search"
              className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search products...</span>
            </Link>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation Links */}
            <div className="p-4 border-b">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Navigation</h3>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block py-2 text-gray-900 hover:text-primary transition-colors"
                      onClick={onClose}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories Accordion */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full p-4 text-left"
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSection === 'categories' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'categories' && (
                <div className="px-4 pb-4 space-y-3">
                  {Object.entries(categoryGroups).map(([group, items]) => (
                    <div key={group}>
                      <h4 className="text-xs font-semibold text-gray-400 mb-2">{group}</h4>
                      <ul className="space-y-1">
                        {items.map((cat) => (
                          <li key={cat.slug}>
                            <Link
                              href={`/category/${cat.slug}`}
                              className="text-sm text-gray-700 hover:text-primary py-1 block"
                              onClick={onClose}
                            >
                              {cat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brands Accordion */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('brands')}
                className="flex items-center justify-between w-full p-4 text-left"
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brands</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSection === 'brands' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'brands' && (
                <div className="px-4 pb-4">
                  <ul className="space-y-1">
                    {brands.slice(0, 10).map((brand) => (
                      <li key={brand.slug}>
                        <Link
                          href={`/brand/${brand.slug}`}
                          className="text-sm text-gray-700 hover:text-primary py-1 block"
                          onClick={onClose}
                        >
                          {brand.name}
                        </Link>
                      </li>
                    ))}
                    {brands.length > 10 && (
                      <li>
                        <Link
                          href="/brands"
                          className="text-sm text-primary font-semibold flex items-center gap-1 pt-2"
                          onClick={onClose}
                        >
                          View All <ChevronRight className="w-3 h-3" />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Goals Accordion */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('goals')}
                className="flex items-center justify-between w-full p-4 text-left"
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Goals</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSection === 'goals' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'goals' && (
                <div className="px-4 pb-4">
                  <ul className="space-y-1">
                    {goals.map((goal) => (
                      <li key={goal.goal}>
                        <Link
                          href={`/goal/${goal.goal.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-sm text-gray-700 hover:text-primary py-1 block"
                          onClick={onClose}
                        >
                          {goal.goal}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <Link
              href="/cart"
              className="flex items-center justify-between w-full px-4 py-3 bg-primary text-dark-bg rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              onClick={onClose}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Cart</span>
              </div>
              {itemCount > 0 && (
                <span className="bg-dark-bg text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <User className="w-5 h-5" />
              <span>Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
