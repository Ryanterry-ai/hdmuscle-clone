'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightIcon,
  CollectionIcon,
  CubeIcon,
  CurrencyRupeeIcon,
  ExternalLinkIcon,
  LightningBoltIcon,
  RefreshIcon,
  ShoppingCartIcon,
  TemplateIcon,
  UserGroupIcon,
} from '@heroicons/react/outline';

type DashboardStats = {
  totalRevenue: number;
  orders: number;
  customers: number;
  products: number;
  collections: number;
  sections: number;
};

type RecentOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
};

type DashboardResponse = {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  siteStatus?: {
    publicSiteUrl?: string | null;
    seoReady?: boolean;
    announcementReady?: boolean;
    socialReady?: boolean;
    copyrightReady?: boolean;
  };
};

const statCards = [
  { key: 'totalRevenue', label: 'Paid revenue', icon: CurrencyRupeeIcon },
  { key: 'orders', label: 'Orders', icon: ShoppingCartIcon },
  { key: 'customers', label: 'Customers', icon: UserGroupIcon },
  { key: 'products', label: 'Products', icon: CubeIcon },
  { key: 'collections', label: 'Collections', icon: CollectionIcon },
  { key: 'sections', label: 'Published sections', icon: TemplateIcon },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async (background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('/api/dashboard/stats', { credentials: 'include' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load dashboard');
      }

      setData(payload);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatOrderDate = (value: string) =>
    new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  const contentCoverage = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: 'Public site URL saved',
        ready: Boolean(data.siteStatus?.publicSiteUrl),
      },
      {
        label: 'SEO settings ready',
        ready: Boolean(data.siteStatus?.seoReady),
      },
      {
        label: 'Announcement configured',
        ready: Boolean(data.siteStatus?.announcementReady),
      },
      {
        label: 'Footer / social configured',
        ready: Boolean(data.siteStatus?.socialReady && data.siteStatus?.copyrightReady),
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="h-56 animate-pulse rounded-[2rem] bg-white/70" />
          <div className="h-56 animate-pulse rounded-[2rem] bg-white/70" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[2rem] bg-white/70" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-800">
        <h2 className="font-heading text-2xl font-semibold">Dashboard unavailable</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6">{error}</p>
        <button
          type="button"
          onClick={() => loadDashboard()}
          className="mt-6 inline-flex items-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-stone-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_34%),linear-gradient(135deg,_rgba(28,25,23,1),_rgba(17,24,39,1))] p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-orange-300">Content control</p>
            <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight">
              Publish changes to hdmuscle.in from this CMS only.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
              The public site reads the published CMS payload directly, so your source of truth is now{' '}
              <strong>Settings</strong> plus <strong>Content</strong>. This dashboard is the control surface for
              homepage copy, brand messaging, announcement bars, and other live storefront content.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/content"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-orange-100"
              >
                Open content manager
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-400/50 hover:bg-white/5"
              >
                Edit site settings
              </Link>
              <a
                href={data?.siteStatus?.publicSiteUrl || 'https://hdmuscle.in'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-400/50 hover:bg-white/5"
              >
                View live site
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-400/50 hover:bg-white/5"
              >
                <RefreshIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Operational status</p>
          <div className="mt-6 space-y-5">
            <div className="rounded-3xl border border-black/5 bg-stone-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-stone-900">Public CMS API</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Published sections are exposed immediately to the live site. Keep drafts private while you edit,
                    then publish when the block is ready to go live.
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-stone-50 p-5">
              <p className="text-sm font-medium text-stone-900">Current coverage</p>
              <div className="mt-4 space-y-3">
                {contentCoverage.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                    <span className="text-sm text-stone-700">{item.label}</span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.ready ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.ready ? 'Ready' : 'Needs work'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-stone-50 p-5">
              <div className="flex items-center gap-3">
                <LightningBoltIcon className="h-5 w-5 text-orange-500" />
                <p className="text-sm font-medium text-stone-900">What changed in this build</p>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-500">
                <li>Legacy sync setup has been removed from the main dashboard workflow.</li>
                <li>Settings and Content are now framed as the source of truth for the public storefront.</li>
                <li>Published section coverage is surfaced directly so the team can manage rollout from one place.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon }) => (
          <article
            key={key}
            className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
                <p className="mt-4 font-heading text-4xl font-semibold tracking-tight text-stone-950">
                  {key === 'totalRevenue'
                    ? formatCurrency(data?.stats.totalRevenue || 0)
                    : (data?.stats[key as keyof DashboardStats] || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Recent orders</p>
              <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-stone-950">
                Latest customer activity
              </h3>
            </div>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-orange-600 transition hover:text-orange-700">
              View all
            </Link>
          </div>

          {data?.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-black/5 text-left text-xs uppercase tracking-[0.16em] text-stone-500">
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-stone-950">{order.order_number}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">{order.customer_name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">{formatOrderDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-right font-medium text-stone-950">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 text-sm text-stone-500">Orders will appear here when database order records exist.</div>
          )}
        </div>

        <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Action rail</p>
          <div className="mt-5 space-y-3">
            <Link
              href="/dashboard/content"
              className="flex items-center justify-between rounded-3xl border border-black/5 bg-stone-50 px-5 py-4 text-sm font-medium text-stone-900 transition hover:border-orange-300 hover:bg-orange-50"
            >
              Manage homepage sections
              <ArrowRightIcon className="h-4 w-4 text-stone-500" />
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center justify-between rounded-3xl border border-black/5 bg-stone-50 px-5 py-4 text-sm font-medium text-stone-900 transition hover:border-orange-300 hover:bg-orange-50"
            >
              Update SEO, social, and footer settings
              <ArrowRightIcon className="h-4 w-4 text-stone-500" />
            </Link>
            <a
              href={data?.siteStatus?.publicSiteUrl || 'https://hdmuscle.in'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-3xl border border-black/5 bg-stone-50 px-5 py-4 text-sm font-medium text-stone-900 transition hover:border-orange-300 hover:bg-orange-50"
            >
              Review the public storefront
              <ExternalLinkIcon className="h-4 w-4 text-stone-500" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
