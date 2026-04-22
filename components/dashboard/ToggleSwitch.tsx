'use client';

import React, { useState } from 'react';

interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function ToggleSwitch({
  checked: controlledChecked,
  onChange,
  disabled = false,
  label,
  className = '',
}: ToggleSwitchProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setInternalChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && (
        <span className="text-sm text-text-muted">{label}</span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        onClick={handleToggle}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full spring-transition cursor-pointer
          ${isChecked ? 'primary-gradient shadow-glow-purple' : 'bg-[#2d2d4a] nm-inset'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute top-1 left-1 w-[18px] h-[18px] rounded-full bg-white spring-transition
            ${isChecked ? 'translate-x-5 scale-110' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}