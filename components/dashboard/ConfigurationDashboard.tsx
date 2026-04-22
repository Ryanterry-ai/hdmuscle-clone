'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatsCard } from './StatsCard';
import { Accordion, AccordionItem } from './Accordion';
import { FloatingLabelInput } from './FloatingLabelInput';
import { ToggleSwitch } from './ToggleSwitch';
import { SaveButton } from './SaveButton';

const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const SecurityIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DesignIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, active: true },
  { label: 'Settings', icon: <SettingsIcon /> },
  { label: 'Database', icon: <DatabaseIcon /> },
  { label: 'Security', icon: <SecurityIcon /> },
  { label: 'Design', icon: <DesignIcon /> },
];

export function ConfigurationDashboard() {
  return (
    <div className="min-h-screen bg-core-bg">
      <Sidebar navItems={navItems} />
      
      <div className="ml-64">
        <Header />
        
        <main className="p-6 pb-32">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-headline font-semibold text-white mb-2 animate-enter">
              Configuration Engine
            </h1>
            <p className="text-text-muted mb-8 animate-enter stagger-1">
              Manage your HD MUSCLE store settings and preferences
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Active Products"
                value={24}
                subtitle="Products live"
                accentColor="purple"
                delay={100}
              />
              <StatsCard
                title="System Health"
                value={87}
                subtitle="All systems operational"
                variant="progress"
                progressValue={87}
                accentColor="emerald"
                delay={200}
              />
              <StatsCard
                title="API Status"
                value="Online"
                variant="pulse"
                accentColor="emerald"
                delay={300}
              />
            </div>

            <Accordion>
              <AccordionItem
                title="Store Information"
                icon={<SettingsIcon />}
                iconBgColor="bg-primary/10"
                iconColor="text-primary"
                defaultOpen
              >
                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput label="Store Name" value="HD MUSCLE" />
                  <FloatingLabelInput label="Support Email" value="support@hdmuscle.in" />
                  <FloatingLabelInput label="Support Phone" value="+91 98765 43210" />
                  <FloatingLabelInput label="Currency" value="INR" />
                </div>
              </AccordionItem>

              <AccordionItem
                title="Announcement Settings"
                icon={<DatabaseIcon />}
                iconBgColor="bg-secondary/10"
                iconColor="text-secondary"
              >
                <div className="space-y-4">
                  <FloatingLabelInput label="Announcement Text" value="Free shipping on orders above ₹999" />
                  <ToggleSwitch label="Enable Announcement Bar" checked={true} />
                </div>
              </AccordionItem>

              <AccordionItem
                title="Social Media Links"
                icon={<SecurityIcon />}
                iconBgColor="bg-success/10"
                iconColor="text-success"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput label="Instagram URL" value="https://instagram.com/hdmuscle" />
                  <FloatingLabelInput label="Facebook URL" value="https://facebook.com/hdmuscle" />
                </div>
              </AccordionItem>

              <AccordionItem
                title="SEO Configuration"
                icon={<DesignIcon />}
                iconBgColor="bg-primary/10"
                iconColor="text-primary"
              >
                <div className="space-y-4">
                  <FloatingLabelInput label="SEO Title" value="HD MUSCLE - Premium Fitness Supplements" />
                  <FloatingLabelInput label="SEO Description" value="India's most trusted fitness supplement brand" />
                  <ToggleSwitch label="Enable SEO Optimizations" checked={true} />
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </main>

        <footer className="fixed bottom-0 right-0 left-64 z-20">
          <div className="h-1 primary-gradient" />
          <div className="nm-flat backdrop-blur-md bg-card-bg/90 rounded-t-2xl p-4">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div>
                <p className="text-sm text-text-muted">Unsaved changes</p>
                <p className="text-xs text-text-muted">You have 4 modified sections</p>
              </div>
              <div className="w-64">
                <SaveButton />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}