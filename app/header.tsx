'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './cart-context';

export default function Header() {
  const { items } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition ${scrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-black'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white tracking-wider">
            HD<span className="text-red-600">MUSCLE</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/collections/best-selling-collection" className="text-sm text-gray-300 hover:text-white font-medium">
              SHOP
            </Link>
            <Link href="/collections/pre-workouts" className="text-sm text-gray-300 hover:text-white font-medium">
              PRE-WORKOUT
            </Link>
            <Link href="/collections/proteins" className="text-sm text-gray-300 hover:text-white font-medium">
              PROTEIN
            </Link>
            <Link href="/collections/bundles" className="text-sm text-gray-300 hover:text-white font-medium">
              BUNDLES
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <span className="text-white font-medium">CART</span>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}