'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
  text: string;
  link?: string;
  linkText?: string;
}

export default function AnnouncementBar({
  text,
  link,
  linkText,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent animate-shimmer bg-[length:200%_100%] text-white text-center py-2.5 px-4">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <span>{text}</span>
        {link && linkText && (
          <a
            href={link}
            className="underline underline-offset-2 font-bold hover:no-underline"
          >
            {linkText} →
          </a>
        )}
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
        aria-label="Close announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
