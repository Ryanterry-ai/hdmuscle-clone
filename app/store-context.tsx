'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  currency: string;
  locale: string;
  symbol: string;
  timezone: string;
  store_email: string;
  store_phone: string;
  logo?: string;
  announcement_text?: string;
  announcement_link?: string;
  copyright_text?: string;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
}

interface StoreContextType {
  settings: Settings;
  storefront: any;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);
const DEFAULT_ANNOUNCEMENT = `FREE SHIPPING OVER ${String.fromCharCode(8377)}9,999`;

function normalizeAnnouncementText(value: string | undefined) {
  const text = String(value || '').trim();
  if (!text) return DEFAULT_ANNOUNCEMENT;
  if (text.includes('$') || /\bUSD\b/i.test(text) || text.includes('?')) return DEFAULT_ANNOUNCEMENT;
  return text;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    currency: 'INR',
    locale: 'en-IN',
    symbol: String.fromCharCode(8377),
    timezone: 'Asia/Kolkata',
    store_email: '',
    store_phone: '',
    logo: '/assets/HD logo.png',
    announcement_text: 'FREE SHIPPING OVER ₹9,999',
    announcement_link: '',
    copyright_text: '',
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    tiktok_url: '',
  });
  const [storefront, setStorefront] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/storefront/published')
      .then(res => res.json())
      .then(data => {
        setStorefront(data);
        const source = data?.settings || data?.site || {};
        setSettings({
          currency: source.currency || 'INR',
          locale: source.locale || 'en-IN',
          symbol: source.symbol || String.fromCharCode(8377),
          timezone: source.timezone || 'Asia/Kolkata',
          store_email: source.store_email || source.supportEmail || '',
          store_phone: source.store_phone || source.supportPhone || '',
          logo: source.logo || '/assets/HD logo.png',
          announcement_text: normalizeAnnouncementText(source.announcement_text || source.announcementText),
          announcement_link: source.announcement_link || source.announcementLink || '',
          copyright_text: source.copyright_text || source.copyrightText || '',
          instagram_url: source.instagram_url || source.instagramUrl || '',
          facebook_url: source.facebook_url || source.facebookUrl || '',
          youtube_url: source.youtube_url || source.youtubeUrl || '',
          tiktok_url: source.tiktok_url || source.tiktokUrl || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <StoreContext.Provider value={{ settings, storefront, loading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

export function formatCurrency(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}
