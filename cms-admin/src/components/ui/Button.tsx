'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles = `
      relative px-6 py-3.5 rounded-2xl font-semibold text-sm uppercase tracking-wider
      transition-all duration-300 ease-spring
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        gradient-bg text-white shadow-lg
        hover:shadow-purple-glow hover:scale-[1.02]
        hover:-translate-y-0.5
      `,
      secondary: `
        nm-flat text-white
        hover:bg-[#161632] hover:-translate-y-0.5
      `,
      ghost: `
        text-slate-400 hover:text-white hover:bg-white/5
      `
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : ''}`}>
          {icon && <span className="w-5 h-5">{icon}</span>}
          {children}
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;