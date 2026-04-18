'use client';

import { CMSSection, CMSSectionContent } from '@/lib/cms';

interface SectionWrapperProps {
  section: CMSSection;
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({ section, children, className = '' }: SectionWrapperProps) {
  const styling = section.styling || {};

  const sectionStyles: React.CSSProperties = {
    paddingTop: styling.padding_top || '60px',
    paddingBottom: styling.padding_bottom || '60px',
    backgroundColor: styling.background_color || 'transparent',
    backgroundImage: styling.background_type === 'image'
      ? `url(${styling.background_image})`
      : styling.background_type === 'gradient' && styling.gradient_colors
        ? `linear-gradient(${styling.gradient_colors.join(', ')})`
        : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: styling.text_color || 'inherit',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: styling.full_width ? '100%' : '1200px',
    margin: styling.full_width ? '0' : '0 auto',
    padding: styling.full_width ? '0' : '0 20px',
  };

  return (
    <section
      id={section.section_key}
      className={className}
      style={sectionStyles}
      data-section-type={section.section_type}
      data-section-key={section.section_key}
      data-section-version={section.version}
    >
      <div style={containerStyles}>{children}</div>
    </section>
  );
}

export function SectionTitle({ title, subtitle }: { title?: string; subtitle?: string }) {
  if (!title && !subtitle) return null;

  return (
    <div className="text-center mb-12">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function CTAButton({
  text,
  link,
  variant = 'primary',
  className = '',
}: {
  text?: string;
  link?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}) {
  if (!text || !link) return null;

  const baseStyles = 'inline-flex items-center justify-center px-8 py-3 rounded-md font-semibold transition-all duration-200';

  const variantStyles = {
    primary: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800',
    outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white',
  };

  return (
    <a
      href={link}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {text}
    </a>
  );
}

export default { SectionWrapper, SectionTitle, CTAButton };
