'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import { navLinks, WHATSAPP_URL, CONTACT_INFO } from '@/lib/data';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Icons.Lightning className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-heading text-dark-900">
              Digi<span className="text-gradient">Agency</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary-600 ${
                  isScrolled ? 'text-dark-700' : 'text-dark-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`} className="flex items-center space-x-2 text-dark-700 hover:text-primary-600 transition-colors">
              <Icons.Phone className="w-4 h-4" />
              <span className="text-sm font-medium">{CONTACT_INFO.phone}</span>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-green-500 hover:bg-green-600 shadow-green-500/25">
                <Icons.MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Us
              </Button>
            </a>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-dark-700 hover:text-primary-600 transition-colors"
          >
            {isMobileMenuOpen ? (
              <Icons.X className="w-6 h-6" />
            ) : (
              <Icons.Menu className="w-6 h-6" />
            )}
          </button>
        </nav>
      </div>

      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen bg-white shadow-xl' : 'max-h-0'
        }`}
      >
        <div className="container-custom py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-dark-700 font-medium hover:text-primary-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`} className="flex items-center space-x-2 text-dark-600">
              <Icons.Phone className="w-4 h-4" />
              <span>{CONTACT_INFO.phone}</span>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-green-500 hover:bg-green-600">
                <Icons.MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
