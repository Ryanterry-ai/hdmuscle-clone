'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { 
  ChevronDownIcon,
  CogIcon,
  CollectionIcon,
  DocumentTextIcon,
  HomeIcon,
  LogoutIcon,
  MenuAlt2Icon,
  PhotographIcon,
  SearchIcon,
  ShoppingCartIcon,
  TagIcon,
  TrendingUpIcon,
  UserGroupIcon,
  ViewGridIcon,
  GlobeAltIcon,
  XIcon,
  BellIcon,
  SparklesIcon,
  MenuIcon,
  PlusIcon
} from '@heroicons/react/outline';

type AdminUser = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/dashboard/products', icon: ViewGridIcon },
  { name: 'Categories', href: '/dashboard/categories', icon: TagIcon },
  { name: 'Collections', href: '/dashboard/collections', icon: CollectionIcon },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCartIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
  { name: 'Media', href: '/dashboard/media', icon: PhotographIcon },
];

const settingsNav = [
  { name: 'General', href: '/dashboard/settings', icon: CogIcon },
  { name: 'Payments', href: '/dashboard/settings/payments', icon: TagIcon },
  { name: 'Domains', href: '/dashboard/settings/domains', icon: GlobeAltIcon },
];

const contentNav = [
  { name: 'Homepage', href: '/dashboard/content/homepage' },
  { name: 'Pages', href: '/dashboard/content/pages' },
  { name: 'Navigation', href: '/dashboard/content/navigation' },
  { name: 'Import', href: '/dashboard/content/import' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const userRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!userRes.ok) {
          router.replace('/login');
          return;
        }
        const userData = await userRes.json();
        if (mounted) setUser(userData.user);
      } catch {
        if (mounted) router.replace('/login');
      }
    };
    load();
    return () => { mounted = false; };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.replace('/login');
    router.refresh();
  };

  const handlePublish = async () => {
    if (!confirm('Publish all changes to make them live on the website?')) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/publish', { method: 'POST' });
      const data = await res.json();
      alert(data.success ? 'Published successfully!' : 'Error: ' + data.error);
    } catch {
      alert('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const currentPage = useMemo(() => {
    const allItems = [...navigation, ...contentNav, ...settingsNav];
    const active = allItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return active?.name || 'Dashboard';
  }, [pathname]);

  const initials = useMemo(() => {
    const value = user?.name || user?.email || 'A';
    return value.split(' ').map((part) => part.charAt(0).toUpperCase()).join('').slice(0, 2);
  }, [user]);

  return (
    <div className="min-h-screen bg-[#050509] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0a0a18', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex h-20 items-center justify-between px-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-white">
              HD
            </div>
            <div>
              <p className="font-semibold text-white text-sm">HD MUSCLE</p>
              <p className="text-xs text-slate-500">CMS Admin</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto scrollbar-thin" style={{ height: 'calc(100vh - 5rem)' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-3 px-3">Main</p>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-r-2 border-purple-500'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-3 px-3">Content</p>
            {contentNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-r-2 border-purple-500'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-3 px-3">Settings</p>
            {settingsNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-r-2 border-purple-500'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <div className="nm-flat rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                <LogoutIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:pl-64">
        <header 
          className="sticky top-0 z-20 h-20 flex items-center justify-between px-6 backdrop-blur-xl"
          style={{ background: 'rgba(5,5,9,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <MenuIcon className="w-6 h-6" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">CMS Dashboard</p>
              <h1 className="text-xl font-semibold text-white">{currentPage}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 xl:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
              />
            </div>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm uppercase tracking-wider gradient-bg text-white transition-all hover:scale-105 hover:shadow-purple-glow disabled:opacity-50"
            >
              <SparklesIcon className="w-4 h-4" />
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </header>

        <main className="p-6 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
