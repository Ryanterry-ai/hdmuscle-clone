'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDownIcon,
  CogIcon,
  CollectionIcon,
  DocumentTextIcon,
  HomeIcon,
  LogoutIcon,
  MailIcon,
  MenuAlt2Icon,
  PhotographIcon,
  SearchIcon,
  ShoppingCartIcon,
  TagIcon,
  TemplateIcon,
  TrendingUpIcon,
  UserGroupIcon,
  ViewGridIcon,
  GlobeAltIcon,
  XIcon,
  BellIcon,
  SparklesIcon,
} from '@heroicons/react/outline';

type AdminUser = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
};

type SiteSettings = {
  store_name?: string;
  store_domain?: string;
  public_site_url?: string;
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    group: 'Content',
    items: [
      { name: 'Homepage', href: '/dashboard/content/homepage', icon: ViewGridIcon },
      { name: 'Pages', href: '/dashboard/content/pages', icon: DocumentTextIcon },
      { name: 'Navigation', href: '/dashboard/content/navigation', icon: MenuAlt2Icon },
      { name: 'Popups', href: '/dashboard/content/popups', icon: BellIcon },
      { name: 'SEO', href: '/dashboard/content/seo', icon: SearchIcon },
    ]
  },
  { 
    group: 'Commerce',
    items: [
      { name: 'Products', href: '/dashboard/products', icon: ViewGridIcon },
      { name: 'Collections', href: '/dashboard/collections', icon: CollectionIcon },
      { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCartIcon },
      { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
      { name: 'Discounts', href: '/dashboard/discounts', icon: TagIcon },
    ]
  },
  { 
    group: 'Marketing',
    items: [
      { name: 'Newsletter', href: '/dashboard/marketing/newsletter', icon: MailIcon },
      { name: 'Forms', href: '/dashboard/marketing/forms', icon: DocumentTextIcon },
      { name: 'Campaigns', href: '/dashboard/marketing/campaigns', icon: BellIcon },
      { name: 'Affiliates', href: '/dashboard/marketing/affiliates', icon: TrendingUpIcon },
    ]
  },
  { name: 'Media', href: '/dashboard/media', icon: PhotographIcon },
  { 
    group: 'Settings',
    items: [
      { name: 'General', href: '/dashboard/settings', icon: CogIcon },
      { name: 'Announcement', href: '/dashboard/settings/announcement', icon: BellIcon },
      { name: 'Footer', href: '/dashboard/settings/footer', icon: MenuAlt2Icon },
      { name: 'Cart Drawer', href: '/dashboard/settings/cart', icon: ShoppingCartIcon },
      { name: 'Search', href: '/dashboard/settings/search', icon: SearchIcon },
      { name: 'Analytics', href: '/dashboard/settings/analytics', icon: ChartBarIcon },
      { name: 'Domains', href: '/dashboard/settings/domains', icon: GlobeAltIcon },
    ]
  },
];

function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [userRes, settingsRes] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/settings', { credentials: 'include' }),
        ]);

        if (!userRes.ok) {
          router.replace('/login');
          return;
        }

        const userData = await userRes.json();
        const settingsData = settingsRes.ok ? await settingsRes.json() : {};

        if (!mounted) return;

        setUser(userData.user);
        setSiteSettings(settingsData || {});
      } catch {
        if (mounted) {
          router.replace('/login');
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const siteName = siteSettings.store_name || 'HD Muscle India';
  const siteDomain = siteSettings.store_domain || siteSettings.public_site_url || 'hdmuscle.in';

  const currentSection = useMemo(() => {
    const activeItem = navigation.find((item) => 
      !item.group && (pathname === item.href || pathname.startsWith(`${item.href}/`))
    );
    return activeItem?.name || 'Dashboard';
  }, [pathname]);

  const initials = useMemo(() => {
    const value = user?.name || user?.email || 'A';
    return value.split(' ').map((part) => part.charAt(0).toUpperCase()).join('').slice(0, 2);
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.replace('/login');
    router.refresh();
  };

  const handlePublish = async () => {
    if (!confirm('Publish all changes to make them live on the website?')) return;
    try {
      const res = await fetch('/api/publish', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Published successfully! All changes are now live on the storefront.');
      } else {
        alert('Error: ' + data.error);
      }
    } catch {
      alert('Failed to publish');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/10 bg-stone-950/95 backdrop-blur transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-semibold text-stone-950">
              HD
            </div>
            <div>
              <p className="font-heading text-lg font-semibold tracking-tight text-white">{siteName}</p>
              <p className="text-xs text-stone-400">{siteDomain}</p>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-xl p-2 text-stone-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100%-5rem)] flex-col justify-between px-4 py-6 overflow-y-auto">
          <nav className="space-y-1">
            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                pathname === '/dashboard'
                  ? 'bg-white text-stone-950 shadow-[0_12px_40px_rgba(251,146,60,0.20)]'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            {/* Content Section */}
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs uppercase tracking-[0.2em] text-stone-500">Content</p>
            </div>
            {[
              { name: 'Homepage', href: '/dashboard/content/homepage' },
              { name: 'Pages', href: '/dashboard/content/pages' },
              { name: 'Navigation', href: '/dashboard/content/navigation' },
              { name: 'Popups', href: '/dashboard/content/popups' },
              { name: 'SEO', href: '/dashboard/content/seo' },
              { name: 'Import', href: '/dashboard/content/import' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'bg-white text-stone-950 shadow-[0_12px_40px_rgba(251,146,60,0.20)]'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Commerce Section */}
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs uppercase tracking-[0.2em] text-stone-500">Commerce</p>
            </div>
            {[
              { name: 'Products', href: '/dashboard/products' },
              { name: 'Collections', href: '/dashboard/collections' },
              { name: 'Orders', href: '/dashboard/orders' },
              { name: 'Customers', href: '/dashboard/customers' },
              { name: 'Discounts', href: '/dashboard/discounts' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'bg-white text-stone-950 shadow-[0_12px_40px_rgba(251,146,60,0.20)]'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Marketing Section */}
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs uppercase tracking-[0.2em] text-stone-500">Marketing</p>
            </div>
            {[
              { name: 'Newsletter', href: '/dashboard/marketing/newsletter' },
              { name: 'Forms', href: '/dashboard/marketing/forms' },
              { name: 'Campaigns', href: '/dashboard/marketing/campaigns' },
              { name: 'Affiliates', href: '/dashboard/marketing/affiliates' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'bg-white text-stone-950 shadow-[0_12px_40px_rgba(251,146,60,0.20)]'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Media */}
            <Link
              href="/dashboard/media"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                pathname === '/dashboard/media'
                  ? 'bg-white text-stone-950 shadow-[0_12px_40px_rgba(251,146,60,0.20)]'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <PhotographIcon className="h-5 w-5" />
              <span>Media</span>
            </Link>

            {/* Settings Section */}
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs uppercase tracking-[0.2em] text-stone-500">Settings</p>
            </div>
            {[
              { name: 'General', href: '/dashboard/settings' },
              { name: 'Logo', href: '/dashboard/settings/logo' },
              { name: 'Payments', href: '/dashboard/settings/payments' },
              { name: 'Announcement', href: '/dashboard/settings/announcement' },
              { name: 'Navigation', href: '/dashboard/content/navigation' },
              { name: 'Footer', href: '/dashboard/settings/footer' },
              { name: 'Cart Drawer', href: '/dashboard/settings/cart' },
              { name: 'Search', href: '/dashboard/settings/search' },
              { name: 'Currency', href: '/dashboard/settings/currency' },
              { name: 'Analytics', href: '/dashboard/settings/analytics' },
              { name: 'Domains', href: '/dashboard/settings/domains' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? 'bg-white text-stone-950 shadow-[0_12px_40px_rgba(251,146,60,0.20)]'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Public Site</p>
            <p className="mt-3 font-heading text-xl font-semibold text-white">{siteName}</p>
            <p className="mt-1 text-sm text-stone-400">{siteDomain}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/content/homepage"
                className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-orange-400/60 hover:text-white"
              >
                Edit content
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-orange-400/60 hover:text-white"
              >
                Site settings
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f6f2ec]/90 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                className="rounded-2xl border border-black/10 bg-white p-3 text-stone-700 transition hover:bg-stone-50 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <MenuAlt2Icon className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">CMS Dashboard</p>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-stone-950">{currentSection}</h1>
              </div>
            </div>

            <div className="hidden min-w-[260px] max-w-md flex-1 items-center justify-center md:flex">
              <div className="relative w-full">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  placeholder="Search products, orders, sections"
                  className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition focus:border-orange-400/60 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePublish}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                title="Publish all changes to live website"
              >
                <SparklesIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Publish</span>
              </button>
              <div className="hidden items-center gap-3 rounded-full border border-black/10 bg-white px-3 py-2 md:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-stone-950">{user?.name || 'Administrator'}</p>
                  <p className="truncate text-xs text-stone-500">{user?.email || 'admin@hdmuscle.in'}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-stone-400" />
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
                onClick={handleLogout}
              >
                <LogoutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] bg-[#f6f2ec] px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}