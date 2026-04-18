'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CubeIcon, 
  FolderIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  TagIcon, 
  DocumentTextIcon, 
  PhotographIcon,
  ChartBarIcon,
  CogIcon,
  ChevronRightIcon
} from '@heroicons/react/outline';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Collections', href: '/collections', icon: FolderIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingBagIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Discounts', href: '/discounts', icon: TagIcon },
  { name: 'Content', href: '/content', icon: DocumentTextIcon },
  { name: 'Media', href: '/media', icon: PhotographIcon },
];

const secondaryNavigation = [
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f172a] flex flex-col z-40">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CMS</span>
          </div>
          <span className="text-white font-semibold text-lg">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {active && (
                <ChevronRightIcon className="w-4 h-4 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          Settings
        </p>
        {secondaryNavigation.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <span className="text-indigo-400 font-semibold text-sm">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-slate-400 truncate">admin@hdmuscle.in</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
