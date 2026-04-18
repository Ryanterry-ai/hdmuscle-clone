'use client';

import React, { useState, useEffect } from 'react';
import { CMSSection, cmsApi, isCMSEnabled } from '@/lib/cms';
import {
  HeroSection,
  FeaturedProductsSection,
  BannerSection,
  NewsletterSection,
  TestimonialsSection,
  FAQSection,
  AnnouncementBar,
} from './sections';
import { SectionWrapper } from './sections/SectionWrapper';

interface CMSSectionsProps {
  fallback?: React.ReactNode;
}

function CMSSectionRenderer({ section }: { section: CMSSection }) {
  switch (section.section_type.toLowerCase()) {
    case 'hero':
    case 'hero_slider':
      return <HeroSection section={section} />;

    case 'featured_products':
    case 'featured_product':
      return <FeaturedProductsSection section={section} />;

    case 'banner':
    case 'banners':
    case 'promotional_banner':
      return <BannerSection section={section} />;

    case 'newsletter_signup':
    case 'newsletter':
      return <NewsletterSection section={section} />;

    case 'testimonials':
    case 'testimonial':
      return <TestimonialsSection section={section} />;

    case 'faq':
    case 'faqs':
      return <FAQSection section={section} />;

    case 'announcement_bar':
      return <AnnouncementBar section={section} />;

    case 'spacer':
      return (
        <SectionWrapper section={section} className="bg-transparent">
          <div style={{ height: section.content.height || '40px' }} />
        </SectionWrapper>
      );

    case 'custom_html':
      return (
        <SectionWrapper section={section} className="bg-white">
          <div dangerouslySetInnerHTML={{ __html: section.content.html || '' }} />
        </SectionWrapper>
      );

    default:
      console.warn(`Unknown section type: ${section.section_type}`);
      return (
        <SectionWrapper section={section} className="bg-gray-100">
          <div className="text-center py-8 text-gray-500">
            Unknown section type: {section.section_type}
          </div>
        </SectionWrapper>
      );
  }
}

export function CMSSections({ fallback }: CMSSectionsProps) {
  const [sections, setSections] = React.useState<CMSSection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cmsEnabled, setCmsEnabled] = React.useState(false);

  React.useEffect(() => {
    setCmsEnabled(isCMSEnabled());
  }, []);

  React.useEffect(() => {
    if (!cmsEnabled) {
      setLoading(false);
      return;
    }

    async function fetchSections() {
      try {
        const response = await cmsApi.sections.getAll();
        if (response.success && response.data.sections) {
          setSections(response.data.sections);
        }
      } catch (err) {
        console.error('Failed to fetch CMS sections:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    }

    fetchSections();
  }, [cmsEnabled]);

  if (!cmsEnabled) {
    return <>{fallback}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Content</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No content sections available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cms-sections">
      {sections.map((section) => (
        <CMSSectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

export function CMSToggle() {
  const [enabled, setEnabled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setEnabled(isCMSEnabled());
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);

    const expires = new Date();
    expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `cms_enabled=${newValue};expires=${expires.toUTCString()};path=/`;

    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg ${
        enabled
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-800 text-white hover:bg-gray-700'
      }`}
      title={enabled ? 'CMS Enabled - Click to disable' : 'CMS Disabled - Click to enable'}
    >
      <span className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-400' : 'bg-gray-400'}`}
        />
        CMS {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

export default CMSSections;
