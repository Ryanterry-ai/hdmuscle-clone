'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from './cart-context';
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import MegaMenu from './components/MegaMenu';
import MobileMenu from './components/MobileMenu';
import SearchDrawer from './components/SearchDrawer';
import AnnouncementBar from './components/AnnouncementBar';
import { Category, Brand, GoalWithProducts } from './lib/data/types';

export default function Header() {
  const { items, itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [goals, setGoals] = useState<GoalWithProducts[]>([]);
  const [settings, setSettings] = useState<{ announcement_bar?: { enabled: boolean; text: string; link?: string; link_text?: string } } | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const shopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    { title: 'Shop', href: '/shop', hasMegaMenu: true },
    { title: 'Brands', href: '/brands' },
    { title: 'Goals', href: '/goals' },
    { title: 'Deals', href: '/deals' },
    { title: 'Authenticity', href: '/authenticity' },
    { title: 'Wholesale', href: '/wholesale' },
    { title: 'Blogs', href: '/blog' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/storefront/catalog');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || null);
          setCategories(data.categories || []);
          setBrands(data.brands || []);
          setGoals((data.goals || []).map((g: any) => ({
            goal: g.goal,
            categories: g.categories || [],
            productCount: g.productCount || 0,
            products: [],
          })));
        }
      } catch (error) {
        console.error('Failed to fetch header data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShopEnter = useCallback(() => {
    if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    setMegaMenuOpen(true);
  }, []);

  const handleShopLeave = useCallback(() => {
    shopTimeoutRef.current = setTimeout(() => setMegaMenuOpen(false), 200);
  }, []);

  const handleMegaMenuEnter = useCallback(() => {
    if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    setMegaMenuOpen(true);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    shopTimeoutRef.current = setTimeout(() => setMegaMenuOpen(false), 200);
  }, []);

  return (
    <>
      {settings?.announcement_bar?.enabled ? (
        <AnnouncementBar
          text={settings.announcement_bar.text}
          link={settings.announcement_bar.link}
          linkText={settings.announcement_bar.link_text}
        />
      ) : null}

      <header
        ref={headerRef}
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm'
            : 'bg-white'
        }`}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-primary transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="flex flex-col leading-none">
                <span className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                  UPGRADED
                </span>
                <span className="text-[10px] lg:text-xs text-gray-400 font-medium tracking-widest uppercase">
                  .co.in
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" onMouseLeave={handleShopLeave}>
              {navItems.map((item) => (
                <div
                  key={item.title}
                  className="relative"
                  onMouseEnter={item.hasMegaMenu ? handleShopEnter : undefined}
                >
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {item.title}
                    {item.hasMegaMenu && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/cart"
                className="p-2 text-gray-700 hover:text-primary transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-dark-bg text-xs font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link
                href="/auth"
                className="p-2 text-gray-700 hover:text-primary transition-colors hidden sm:block"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        <div
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <MegaMenu
            isOpen={megaMenuOpen}
            onClose={() => setMegaMenuOpen(false)}
            categories={categories}
            brands={brands}
            goals={goals}
          />
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        categories={categories}
        brands={brands}
        goals={goals}
        navItems={navItems}
        itemCount={itemCount}
      />

      {/* Search Drawer */}
      <SearchDrawer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        suggestions={[]}
      />
    </>
  );
}
