'use client';

import { InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', id, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && String(props.value).length > 0;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="relative">
      <div className="relative">
        <input
          id={inputId}
          className={`
            peer w-full px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]
            text-white placeholder-transparent
            shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(255,255,255,0.02)]
            transition-all duration-300 ease-spring
            focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          placeholder={label || ' '}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={`
              absolute left-4 transition-all duration-300 ease-spring pointer-events-none
              ${focused || hasValue
                ? 'top-1.5 text-xs text-purple-400 bg-[#121225] px-1 -translate-y-0.5'
                : 'top-1/2 -translate-y-1/2 text-slate-400'
              }
            `}
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
}