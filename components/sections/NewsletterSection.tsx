'use client';

import { CMSSection, CMSSectionContent } from '@/lib/cms';
import { SectionWrapper } from './SectionWrapper';
import { useState } from 'react';

interface NewsletterSectionProps {
  section: CMSSection;
}

export function NewsletterSection({ section }: NewsletterSectionProps) {
  const content = section.content as CMSSectionContent;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
      } else {
        const data = await response.json();
        setStatus('error');
        setMessage(data.message || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <SectionWrapper section={section} className="bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <svg
            className="w-12 h-12 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">
          {content.newsletter_heading || 'Stay Updated'}
        </h2>
        <p className="text-gray-300 mb-8">
          {content.newsletter_subtext || 'Subscribe to our newsletter for exclusive offers and updates'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={content.placeholder_text || 'Enter your email'}
            required
            className="flex-1 px-4 py-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: content.button_color || undefined }}
          >
            {status === 'loading' ? 'Subscribing...' : (content.button_text || 'Subscribe')}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
        {content.consent_text && (
          <p className="mt-4 text-xs text-gray-400">
            {content.consent_text}
          </p>
        )}
      </div>
    </SectionWrapper>
  );
}

export default NewsletterSection;
