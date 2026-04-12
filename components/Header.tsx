"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { navLinks, megaMenuCategories } from "@/lib/data";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
      {/* Top Bar - Free Shipping & WhatsApp */}
      <div className="bg-[#1d1d1d] text-white text-center py-1 text-xs font-medium">
        <span>
          FREE SHIPPING OVER ₹999 | WhatsApp us to order directly on <a href="https://wa.me/919557513017" className="hover:underline font-bold">+91 955-751-3017</a>
        </span>
      </div>

      {/* Main Header */}
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1={4} x2={20} y1={12} y2={12} />
              <line x1={4} x2={20} y1={6} y2={6} />
              <line x1={4} x2={20} y1={18} y2={18} />
            </svg>
          </button>

          {/* Logo - Larger and shifted left */}
          <Link href="/" className="flex-shrink-0 -ml-2 md:-ml-4">
            <div className="relative w-[120px] h-[35px] md:w-[150px] md:h-[45px]">
              <Image 
                src="/images/logo.png"
                alt="HD MUSCLE"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 120px, 150px"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div 
                key={link.href}
                className="relative"
                onMouseEnter={() => setActiveMenu(link.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link 
                  href={link.href}
                  className="font-oswald text-sm font-medium text-[#1d1d1d] uppercase tracking-wide hover:text-[#ffcc00] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ffcc00] transition-all duration-300 group-hover:w-full" />
                </Link>
              </div>
            ))}
          </nav>

          {/* Right Icons - All shifted right */}
          <div className="flex items-center space-x-4 md:space-x-6 ml-auto">
            {/* Search */}
            <button 
              className="p-2"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx={11} cy={11} r={8} />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            {/* Account - points to hdmuscle.in */}
            <Link href="https://hdmuscle.in/customer_authentication/redirect?locale=en" className="p-2" aria-label="Account">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx={12} cy={7} r={4} />
              </svg>
            </Link>

            {/* Cart - points to hdmuscle.in */}
            <Link href="https://hdmuscle.in/cart" className="p-2 relative" aria-label="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx={8} cy={21} r={1} />
                <circle cx={19} cy={21} r={1} />
                <path d="M2.05 2.05h2l2.66 12.73a2 2 0 0 0 2 1.94h9.94a2 2 0 0 0 2-1.94l1.66-7.94H5.12" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg p-4">
          <div className="max-w-[1100px] mx-auto flex gap-2">
            <input 
              type="text" 
              placeholder="Search" 
              className="flex-1 border border-[#e5e5e5] rounded px-4 py-2 text-sm focus:outline-none focus:border-[#1d1d1d]"
            />
            <button className="text-[#737373] hover:text-[#1d1d1d]">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <div className="relative w-[100px] h-[30px]">
                  <Image 
                    src="/images/logo.png"
                    alt="HD MUSCLE"
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 font-oswald text-sm uppercase text-[#1d1d1d] border-b border-[#e5e5e5]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}