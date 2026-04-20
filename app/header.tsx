'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from './cart-context';

export default function Header() {
  const { items } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <header ref={menuRef} className={`sticky top-0 z-50 bg-white border-b border-gray-200 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="flex items-center justify-between px-8 py-4.5 gap-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-3xl font-bold uppercase tracking-[3px]">
            HD<span className="text-purple-600">MUSCLE</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <div 
              className="relative"
              onMouseEnter={() => setOpenMenu('goals')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link 
                href="#" 
                className={`text-sm font-semibold uppercase tracking-[1.5px] flex items-center gap-1.5 ${openMenu === 'goals' ? 'text-purple-600' : ''}`}
              >
                Shop by Goal
                <i className={`fas fa-chevron-down text-[10px] transition ${openMenu === 'goals' ? 'rotate-180' : ''}`}></i>
              </Link>
              {openMenu === 'goals' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-white border border-gray-200 p-8 flex gap-12 shadow-xl min-w-[800px]">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-[1.5px] mb-4">Build Muscle</h4>
                    <ul className="space-y-2.5">
                      <li><Link href="/collections/proteins" className="text-sm text-gray-500 hover:text-purple-600">Protein</Link></li>
                      <li><Link href="/collections/mass-gainers" className="text-sm text-gray-500 hover:text-purple-600">Mass Gainers</Link></li>
                      <li><Link href="/collections/creatine" className="text-sm text-gray-500 hover:text-purple-600">Creatine</Link></li>
                      <li><Link href="/collections/bcaas" className="text-sm text-gray-500 hover:text-purple-600">BCAAs</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-[1.5px] mb-4">Lose Fat</h4>
                    <ul className="space-y-2.5">
                      <li><Link href="/collections/fat-burners" className="text-sm text-gray-500 hover:text-purple-600">Fat Burners</Link></li>
                      <li><Link href="/collections/thermogenics" className="text-sm text-gray-500 hover:text-purple-600">Thermogenics</Link></li>
                      <li><Link href="/collections/l-carnitine" className="text-sm text-gray-500 hover:text-purple-600">L-Carnitine</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-[1.5px] mb-4">Performance</h4>
                    <ul className="space-y-2.5">
                      <li><Link href="/collections/pre-workouts" className="text-sm text-gray-500 hover:text-purple-600">Pre-Workout</Link></li>
                      <li><Link href="/collections/intra-workouts" className="text-sm text-gray-500 hover:text-purple-600">Intra-Workout</Link></li>
                      <li><Link href="/collections/electrolytes" className="text-sm text-gray-500 hover:text-purple-600">Electrolytes</Link></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setOpenMenu('supplements')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link 
                href="/collections/supplements" 
                className={`text-sm font-semibold uppercase tracking-[1.5px] flex items-center gap-1.5 ${openMenu === 'supplements' ? 'text-purple-600' : ''}`}
              >
                Supplements
                <i className={`fas fa-chevron-down text-[10px] transition ${openMenu === 'supplements' ? 'rotate-180' : ''}`}></i>
              </Link>
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setOpenMenu('bundles')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link 
                href="/collections/bundles" 
                className={`text-sm font-semibold uppercase tracking-[1.5px] flex items-center gap-1.5 ${openMenu === 'bundles' ? 'text-purple-600' : ''}`}
              >
                Bundles
                <i className={`fas fa-chevron-down text-[10px] transition ${openMenu === 'bundles' ? 'rotate-180' : ''}`}></i>
              </Link>
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setOpenMenu('apparel')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link 
                href="/collections/apparel" 
                className={`text-sm font-semibold uppercase tracking-[1.5px] flex items-center gap-1.5 ${openMenu === 'apparel' ? 'text-purple-600' : ''}`}
              >
                Apparel
                <i className={`fas fa-chevron-down text-[10px] transition ${openMenu === 'apparel' ? 'rotate-180' : ''}`}></i>
              </Link>
            </div>

            <Link href="/collections/new" className="text-sm font-semibold uppercase tracking-[1.5px]">
              New
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-xl cursor-pointer hover:text-purple-600 transition bg-transparent border-none">
            <i className="fas fa-search"></i>
          </button>
          <Link href="/auth" className="text-xl cursor-pointer hover:text-purple-600 transition">
            <i className="far fa-user"></i>
          </Link>
          <Link href="/cart" className="relative text-xl cursor-pointer hover:text-purple-600 transition">
            <i className="fas fa-shopping-bag"></i>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 w-[18px] h-[18px] bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}