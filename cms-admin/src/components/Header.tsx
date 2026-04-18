'use client';

import { useRouter } from 'next/navigation';
import { MenuIcon, BellIcon, LogoutIcon } from '@heroicons/react/outline';
import { useAuthStore } from '@/store/auth';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none md:hidden">
        <MenuIcon className="h-6 w-6" />
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex"></div>
        <div className="ml-4 flex items-center md:ml-6">
          <button className="p-1 text-gray-400 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
          </button>
          <div className="ml-4 flex items-center">
            <div className="flex items-center">
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-800">{user?.name || user?.email}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-1 text-gray-400 hover:text-gray-500"
              >
                <LogoutIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
