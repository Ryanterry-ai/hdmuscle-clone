'use client';

import { Icons } from '@/components/ui/Icons';
import { WHATSAPP_URL } from '@/lib/data';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all duration-300 hover:scale-110 pulse-ring"
      aria-label="Chat on WhatsApp"
    >
      <Icons.MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}
