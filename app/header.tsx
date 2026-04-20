'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from './cart-context';
import { getSettings } from './lib/cms';

const supplementsMenu = [
  { title: 'PRE-WORKOUT', items: ['PumpHD', 'PreHD Essential', 'PreHD Ultra', 'PreHD Elite'] },
  { title: 'INTRA-WORKOUT + RECOVERY', items: ['CarbHD', 'IntraHD', 'CreaHD', 'GlutAHD'] },
  { title: 'PROTEIN', items: ['ProHD', 'ProHD Isolate'] },
  { title: 'HEALTH + WELLNESS', items: ['MultiHD', 'GreensHD', 'BurnHD', 'GlycoHD', 'SleepHD', 'BetaH', 'VitaHD'] },
];

const apparelMenu = [
  { title: 'NEW ARRIVALS', items: ['New Arrivals'] },
  { title: 'TOPS', items: ['T-Shirts', 'Sweaters'] },
  { title: 'BOTTOMS', items: ['Pants + Shorts'] },
  { title: 'ACCESSORIES', items: ['Hats', 'Accessories'] },
  { title: 'WOMENS', items: ['Womens'] },
];

export default function Header() {
  const { items } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/storefront/published')
      .then(res => res.json())
      .then(data => setSettings(getSettings(data)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header ref={menuRef} className={`sticky top-0 z-50 transition ${scrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-black'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white tracking-wider">
            HD<span className="text-red-600">MUSCLE</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <div 
              className="relative"
              onMouseEnter={() => setOpenMenu('supplements')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link 
                href="/collections/shop-all-supplements" 
                className={`text-sm text-gray-300 hover:text-white font-medium flex items-center gap-1 ${openMenu === 'supplements' ? 'text-white' : ''}`}
              >
                SUPPLEMENTS
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {openMenu === 'supplements' && (
                <div className="absolute top-full left-0 mt-0 w-[700px] bg-white text-black shadow-xl p-6 grid grid-cols-4 gap-6">
                  <div className="col-span-4 border-b pb-3 mb-3">
                    <Link href="/collections/shop-all-supplements" className="text-lg font-bold hover:text-red-600">
                      SHOP ALL SUPPLEMENTS →
                    </Link>
                  </div>
                  {supplementsMenu.map((category) => (
                    <div key={category.title}>
                      <h4 className="font-bold text-sm mb-3 border-b pb-1">{category.title}</h4>
                      <ul className="space-y-2">
                        {category.items.map((item) => (
                          <li key={item}>
                            <Link 
                              href={`/products/${item.toLowerCase().replace(/hd/g, '-hd')}`} 
                              className="text-sm text-gray-600 hover:text-red-600"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="col-span-2 bg-gray-100 p-4">
                    <h4 className="font-bold text-sm mb-2">BUNDLES</h4>
                    <p className="text-xs text-gray-600 mb-2">Save up to 20% with bundles</p>
                    <Link href="/collections/bundles" className="text-sm text-red-600 font-medium hover:underline">
                      View Bundles →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/collections/bundles" className="text-sm text-gray-300 hover:text-white font-medium">
              BUNDLES
            </Link>

            <div 
              className="relative"
              onMouseEnter={() => setOpenMenu('apparel')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link 
                href="/collections/apparel-accessories-2" 
                className={`text-sm text-gray-300 hover:text-white font-medium flex items-center gap-1 ${openMenu === 'apparel' ? 'text-white' : ''}`}
              >
                APPAREL + ACCESSORIES
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {openMenu === 'apparel' && (
                <div className="absolute top-full left-0 mt-0 w-[400px] bg-white text-black shadow-xl p-4">
                  {apparelMenu.map((category) => (
                    <div key={category.title} className="py-2 border-b last:border-0">
                      <h4 className="font-bold text-sm mb-2">{category.title}</h4>
                      <ul className="space-y-1">
                        {category.items.map((item) => (
                          <li key={item}>
                            <Link 
                              href="/collections/new-25" 
                              className="text-sm text-gray-600 hover:text-red-600"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
