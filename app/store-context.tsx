'use client';

import { createContext, useContext, useState, useEffect, use } from 'react';

interface Settings {
  currency: string;
  locale: string;
  symbol: string;
  timezone: string;
  store_email: string;
  store_phone: string;
}

interface StoreContextType {
  settings: Settings;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    currency: 'INR',
    locale: 'en-IN',
    symbol: '₹',
    timezone: 'Asia/Kolkata',
    store_email: '',
    store_phone: ''
  });

  useEffect(() => {
    fetch('/api/storefront/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <StoreContext.Provider value={{ settings }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

export function formatCurrency(amount: number, currency: string, locale: string, symbol: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}