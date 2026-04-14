'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { navLinks, services, CONTACT_INFO } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-white">
      <div className="container-custom">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Icons.Lightning className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-heading">
                Digi<span className="text-gradient">Agency</span>
              </span>
            </Link>
            <p className="text-dark-500 mb-6">
              Premium yet affordable digital solutions helping local businesses grow online with websites, apps, and lead generation systems.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Icons.Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Icons.Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Icons.Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Icons.Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-dark-500 hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {services.slice(0, 5).map((service) => (
                <li key={service.id}>
                  <Link href="/services" className="text-dark-500 hover:text-primary-400 transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Icons.MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                <span className="text-dark-500">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Icons.Phone className="w-5 h-5 text-primary-400" />
                <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`} className="text-dark-500 hover:text-primary-400 transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Icons.Mail className="w-5 h-5 text-primary-400" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-dark-500 hover:text-primary-400 transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Icons.Clock className="w-5 h-5 text-primary-400" />
                <span className="text-dark-500">Mon-Sat: 9AM - 7PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-dark-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-600 text-sm">
              2026 {CONTACT_INFO.name}. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="#" className="text-dark-600 hover:text-primary-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-dark-600 hover:text-primary-400 transition-colors">Terms of Service</Link>
              <Link href="#" className="text-dark-600 hover:text-primary-400 transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
