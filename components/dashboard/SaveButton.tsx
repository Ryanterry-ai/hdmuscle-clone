'use client';

import React, { useState } from 'react';

type ButtonState = 'default' | 'loading' | 'success';

interface SaveButtonProps {
  onClick?: () => void | Promise<void>;
  className?: string;
}

export function SaveButton({ onClick, className = '' }: SaveButtonProps) {
  const [state, setState] = useState<ButtonState>('default');

  const handleClick = async () => {
    if (state !== 'default') return;
    
    setState('loading');
    
    try {
      if (onClick) {
        await onClick();
      }
      
      setState('success');
      
      setTimeout(() => {
        setState('default');
      }, 2000);
    } catch {
      setState('default');
    }
  };

  const buttonContent = {
    default: (
      <>
        <span>SAVE_CONFIGURATION</span>
      </>
    ),
    loading: (
      <>
        <SpinnerIcon />
        <span>SYNCING_DATA...</span>
      </>
    ),
    success: (
      <>
        <CheckIcon />
        <span>SUCCESSFUL_SYNC</span>
      </>
    ),
  };

  const buttonClasses = {
    default: 'primary-gradient',
    loading: 'bg-card-bg',
    success: 'bg-success/80',
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className={`${buttonClasses[state]} w-full py-5 px-6 rounded-2xl font-bold text-xs uppercase tracking-btn
        spring-transition flex items-center justify-center gap-2
        ${state === 'loading' ? 'cursor-wait' : 'cursor-pointer'}
        ${state === 'default' ? 'hover:opacity-90 active:scale-[0.98]' : ''}
        ${className}`}
    >
      {buttonContent[state]}
    </button>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}