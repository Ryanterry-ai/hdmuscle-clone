'use client';

import { InputHTMLAttributes } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export default function Toggle({ label, checked, onChange, className = '', ...props }: ToggleProps) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-all duration-400 ease-spring
            ${checked 
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-purple-500/30' 
              : 'bg-[#2d2d4a]'
            }
          `}
          style={{ boxShadow: checked ? '0 0 20px rgba(124, 58, 237, 0.4)' : 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
        >
          <div
            className={`
              absolute top-1 w-4.5 h-4.5 bg-white rounded-full shadow-lg
              transition-all duration-400 ease-spring
              ${checked ? 'left-[22px] scale-110' : 'left-1'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className="text-sm text-slate-300 font-medium">
          {label}
        </span>
      )}
    </label>
  );
}