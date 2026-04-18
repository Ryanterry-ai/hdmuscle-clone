'use client';

import { createContext, useContext, useState } from 'react';

interface Site {
  id: string;
  name: string;
  domain: string;
  logo: string;
  plan: string;
}

interface SiteContextType {
  currentSite: Site;
  setCurrentSite: (site: Site) => void;
  sites: Site[];
}

const SiteContext = createContext<SiteContextType | null>(null);

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    return {
      currentSite: { id: '1', name: 'HD Muscle', domain: 'hdmuscle.in', logo: '💪', plan: 'Pro' },
      setCurrentSite: () => {},
      sites: []
    };
  }
  return context;
}

export const defaultSites: Site[] = [
  { id: '1', name: 'HD Muscle', domain: 'hdmuscle.in', logo: '💪', plan: 'Pro' },
  { id: '2', name: 'FitLife Store', domain: 'fitlifestore.com', logo: '🏋️', plan: 'Pro' },
  { id: '3', name: 'Gym Pro', domain: 'gympro.com', logo: '🏃', plan: 'Basic' },
];

export { SiteContext };
