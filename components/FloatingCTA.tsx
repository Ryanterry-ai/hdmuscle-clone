'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';
import { WHATSAPP_URL } from '@/lib/data';

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-5 py-3 rounded-full shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:scale-105"
      >
        <Icons.MessageCircle className="w-5 h-5" />
        <span className="font-semibold text-sm whitespace-nowrap">Get Free Quote</span>
      </a>
    </div>
  );
}
