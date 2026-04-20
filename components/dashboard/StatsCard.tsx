'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'progress' | 'pulse';
  progressValue?: number;
  accentColor?: 'purple' | 'pink' | 'emerald';
  className?: string;
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default', 
  progressValue = 0,
  accentColor = 'purple',
  className = '',
  delay = 0
}: StatsCardProps) {
  const colors = {
    purple: 'border-t-primary text-primary',
    pink: 'border-t-secondary text-secondary',
    emerald: 'border-t-success text-success',
  };

  return (
    <div 
      className={`nm-flat rounded-3xl p-6 spring-transition hover:-translate-y-1 hover:shadow-glow-purple ${className} animate-enter`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`border-t-4 ${colors[accentColor]} rounded-t-3xl -mt-6 mb-4 pt-2`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-tech text-text-muted mb-1">{title}</p>
            <h3 className="text-3xl font-headline font-semibold text-white">{value}</h3>
            {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
          </div>
          
          {variant === 'progress' && (
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-card-bg"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${progressValue * 1.76} 176`}
                  strokeLinecap="round"
                  className={accentColor === 'purple' ? 'text-primary' : accentColor === 'pink' ? 'text-secondary' : 'text-success'}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {progressValue}%
              </span>
            </div>
          )}

          {variant === 'pulse' && (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${accentColor === 'emerald' ? 'bg-success animate-pulse-glow' : 'bg-primary'}`} />
              {icon}
            </div>
          )}

          {variant === 'default' && icon && (
            <div className="text-text-muted">{icon}</div>
          )}
        </div>
      </div>
    </div>
  );
}
