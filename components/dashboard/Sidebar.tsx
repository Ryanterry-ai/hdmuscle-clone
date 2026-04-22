'use client';

import React from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  userName?: string;
  userRole?: string;
}

export function Sidebar({ navItems, userName = 'Admin User', userRole = 'Administrator' }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a18] border-r border-white/5 flex flex-col z-50">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-headline font-semibold text-white tracking-wide">CONFIG</h1>
            <p className="text-[10px] text-text-muted tracking-tech uppercase font-bold">Engine</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left spring-transition group
                  ${item.active 
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-r-3 border-primary' 
                    : 'hover:bg-white/5'}`}
              >
                <span className={`spring-transition ${item.active ? 'text-primary' : 'text-text-muted group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className={`font-bold text-xs uppercase tracking-tech-sm ${item.active ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="nm-flat rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider truncate">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
