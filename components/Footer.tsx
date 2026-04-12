"use client";

import Link from "next/link";
import { footerLinks } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-[#1d1d1d] text-white pt-10 pb-6">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* Newsletter Section */}
        <div className="mb-8 pb-8 border-b border-white/20">
          <p className="text-sm text-center mb-4">
            Receive email updates on stuff you&apos;ll probably want to know about, including products, launches, and events. All hype, no spam — but you can always unsubscribe at anytime.
          </p>
          <form className="max-w-md mx-auto flex gap-2">
            <input 
              type="email" 
              placeholder="your@email.address" 
              className="flex-1 bg-white text-black px-4 py-2 text-sm rounded focus:outline-none"
            />
            <button 
              type="submit"
              className="bg-[#ffcc00] text-black px-6 py-2 text-sm font-bold uppercase hover:bg-white transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Shop */}
          <div>
            <h3 className="font-oswald text-sm font-bold uppercase mb-3 tracking-wider">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[#ffcc00] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-oswald text-sm font-bold uppercase mb-3 tracking-wider">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[#ffcc00] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-oswald text-sm font-bold uppercase mb-3 tracking-wider">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[#ffcc00] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Links */}
          <div className="col-span-2 md:col-span-1">
            <ul className="space-y-2">
              <li><Link href="/search" className="text-sm text-white/70 hover:text-[#ffcc00] transition-colors">SEARCH</Link></li>
              <li><Link href="/pages/wholesale-inquiry" className="text-sm text-white/70 hover:text-[#ffcc00] transition-colors">WHOLESALE INQUIRY</Link></li>
              <li><Link href="/pages/join" className="text-sm text-white/70 hover:text-[#ffcc00] transition-colors">JOIN THE HD COLLECTIVE</Link></li>
              <li><Link href="/pages/our-story" className="text-sm text-white/70 hover:text-[#ffcc00] transition-colors">ABOUT US</Link></li>
            </ul>
          </div>
        </div>

        {/* Social & Payment */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/hd.muscle/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffcc00] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect width={20} height={20} x={2} y={2} rx={5} ry={5} />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1={17.5} x2={17.51} y1={6.5} y2={6.5} />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@hd.muscle?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffcc00] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/hd.muscle.supps/" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffcc00] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/c/HDMuscle" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffcc00] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs">American Express</span>
              <span className="text-white/50 text-xs">Apple Pay</span>
              <span className="text-white/50 text-xs">Diners Club</span>
              <span className="text-white/50 text-xs">Discover</span>
              <span className="text-white/50 text-xs">Google Pay</span>
              <span className="text-white/50 text-xs">Mastercard</span>
              <span className="text-white/50 text-xs">Shop Pay</span>
              <span className="text-white/50 text-xs">Visa</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-6">
            <p className="text-white/50 text-xs">
              &copy; 2026 HD MUSCLE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}