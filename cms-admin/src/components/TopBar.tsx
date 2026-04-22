'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BellIcon, 
  SearchIcon, 
  ChevronDownIcon,
  LogoutIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/outline';
import { useAuthStore } from '@/store/auth';

export default function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-80 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-slate-400" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-2">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'admin@example.com'}</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <CogIcon className="w-4 h-4" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
