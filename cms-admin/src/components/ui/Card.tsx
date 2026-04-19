'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  accent?: 'purple' | 'pink' | 'green' | 'yellow';
}

export default function Card({ children, className = '', hover = true, accent = 'purple' }: CardProps) {
  const accentColors = {
    purple: 'border-t-purple-500',
    pink: 'border-t-pink-500',
    green: 'border-t-emerald-500',
    yellow: 'border-t-yellow-500'
  };

  return (
    <div
      className={`
        rounded-3xl p-6 nm-flat border-t-[3px] ${accentColors[accent]}
        ${hover ? 'transition-all duration-300 hover:bg-[#161632] hover:-translate-y-1 hover:shadow-xl' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-slate-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}