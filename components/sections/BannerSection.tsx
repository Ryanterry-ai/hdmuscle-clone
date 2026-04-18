'use client';

import { CMSSection, CMSSectionContent } from '@/lib/cms';
import { SectionWrapper, CTAButton } from './SectionWrapper';

interface BannerSectionProps {
  section: CMSSection;
}

interface BannerItem {
  image: string;
  alt_text?: string;
  headline?: string;
  subtext?: string;
  cta_text?: string;
  cta_link?: string;
  alignment?: 'left' | 'center' | 'right';
}

export function BannerSection({ section }: BannerSectionProps) {
  const content = section.content as CMSSectionContent;
  const banners: BannerItem[] = content.banners || [];

  if (banners.length === 0) {
    return null;
  }

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  return (
    <SectionWrapper section={section} className="py-12">
      <div className={`grid gap-6 ${
        banners.length === 1
          ? 'grid-cols-1'
          : banners.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {banners.map((banner, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl group cursor-pointer"
            style={{ minHeight: '300px' }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${banner.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div
              className={`absolute inset-0 flex flex-col justify-end p-6 text-white ${alignmentClasses[banner.alignment || 'center']}`}
            >
              {banner.headline && (
                <h3 className="text-2xl font-bold mb-2">{banner.headline}</h3>
              )}
              {banner.subtext && (
                <p className="text-gray-200 mb-4 max-w-md">{banner.subtext}</p>
              )}
              {banner.cta_text && banner.cta_link && (
                <CTAButton
                  text={banner.cta_text}
                  link={banner.cta_link}
                  variant="primary"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export default BannerSection;
