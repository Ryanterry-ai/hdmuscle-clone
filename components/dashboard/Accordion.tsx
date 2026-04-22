'use client';

import React, { useState } from 'react';

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  icon,
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary',
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`nm-flat rounded-[2.5rem] overflow-hidden spring-transition ${isOpen ? 'shadow-glow-purple' : ''} animate-enter`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-6 text-left cursor-pointer"
      >
        <div className={`w-16 h-16 rounded-2xl ${iconBgColor} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-headline font-semibold text-white">{title}</h3>
        </div>
        <div className={`spring-transition ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className={`accordion-content ${isOpen ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          <div className="px-6 pb-6 pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
}