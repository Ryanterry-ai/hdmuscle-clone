'use client';

import React, { useState, useRef, useEffect } from 'react';

interface FloatingLabelInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FloatingLabelInput({
  label,
  type = 'text',
  value: controlledValue,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
}: FloatingLabelInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const isActive = focused || value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        required={required}
        placeholder={isActive ? placeholder : undefined}
        className={`w-full bg-white/[0.02] border ${focused ? 'border-primary' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm text-white outline-none spring-transition
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary'}`}
      />
      <label
        className={`absolute spring-transition pointer-events-none ${isActive ? 'text-xs -top-2 text-primary bg-card-bg px-2' : 'text-sm text-text-muted'}
          ${focused ? 'text-primary' : ''} left-6`}
        style={{
          top: isActive ? '-0.6rem' : '1.1rem',
          transform: isActive ? 'scale(0.75)' : 'scale(1)',
          transformOrigin: 'left center',
        }}
      >
        {label}
        {required && <span className="text-secondary ml-1">*</span>}
      </label>
    </div>
  );
}