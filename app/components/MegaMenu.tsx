'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Award, Target, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { Category, Brand, GoalWithProducts } from '../lib/data/types';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  brands: Brand[];
  goals: GoalWithProducts[];
}

export default function MegaMenu({ isOpen, onClose, categories, brands, goals }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'New Arrivals', href: '/new-arrivals', icon: Star },
    { title: 'Best Sellers', href: '/best-sellers', icon: TrendingUp },
    { title: 'Deals', href: '/deals', icon: Star },
  ];

  const categoryGroups = categories.reduce((acc, cat) => {
    const group = cat.menu_group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div
      ref={menuRef}
      className={`mega-menu-panel absolute left-1/2 -translate-x-1/2 w-full max-w-[1200px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="grid grid-cols-4 gap-6 p-6">
        {/* Categories Column */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Dumbbell className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Categories</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(categoryGroups).map(([group, items]) => (
              <div key={group}>
                <h4 className="text-xs font-semibold text-gray-500 mb-2">{group}</h4>
                <ul className="space-y-1">
                  {items.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="text-sm text-gray-700 hover:text-primary transition-colors block py-1"
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
        </div>

        {/* Brands Column */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Award className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Brands</h3>
          </div>
          <ul className="space-y-1">
            {brands.slice(0, 12).map((brand) => (
              <li key={brand.slug}>
                <Link
                  href={`/brand/${brand.slug}`}
                  className="text-sm text-gray-700 hover:text-primary transition-colors block py-1"
                  onClick={onClose}
                >
                  {brand.name}
                </Link>
              </li>
            ))}
            {brands.length > 12 && (
              <li>
                <Link
                  href="/brands"
                  className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 pt-2"
                  onClick={onClose}
                >
                  View All Brands <ChevronRight className="w-3 h-3" />
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Goals Column */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Goals</h3>
          </div>
          <ul className="space-y-1">
            {goals.map((goal) => (
              <li key={goal.goal}>
                <Link
                  href={`/goal/${goal.goal.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-gray-700 hover:text-primary transition-colors block py-1"
                  onClick={onClose}
                >
                  {goal.goal}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links Column */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quick Links</h3>
          </div>
          <ul className="space-y-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors py-1 group"
                    onClick={onClose}
                  >
                    <Icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
