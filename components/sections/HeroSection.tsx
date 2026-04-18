'use client';

import { CMSSection, CMSSectionContent } from '@/lib/cms';
import { SectionWrapper, SectionTitle, CTAButton } from './SectionWrapper';

interface HeroSectionProps {
  section: CMSSection;
}

export function HeroSection({ section }: HeroSectionProps) {
  const content = section.content as CMSSectionContent;

  return (
    <SectionWrapper section={section} className="relative overflow-hidden min-h-[600px] flex items-center">
      {content.background_image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.background_image})` }}
        />
      )}
      {content.background_video && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={content.background_video}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      {content.overlay_opacity !== undefined && content.overlay_opacity > 0 && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: content.overlay_opacity / 100 }}
        />
      )}
      <div className="relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center px-4">
          {content.announcement && (
            <div className="mb-6">
              <span className="inline-block bg-red-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                {content.announcement}
              </span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {content.headline}
          </h1>
          {content.subheadline && (
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              {content.subheadline}
            </p>
          )}
          <div className="flex flex-wrap gap-4 justify-center">
            {content.cta_text && content.cta_link && (
              <CTAButton
                text={content.cta_text}
                link={content.cta_link}
                variant="primary"
              />
            )}
            {content.secondary_cta_text && content.secondary_cta_link && (
              <CTAButton
                text={content.secondary_cta_text}
                link={content.secondary_cta_link}
                variant="outline"
              />
            )}
          </div>
          {content.badges && content.badges.length > 0 && (
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {content.badges.map((badge: string, index: number) => (
                <div key={index} className="flex items-center text-white/80">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {badge}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {content.scroll_indicator && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
    </SectionWrapper>
  );
}

export default HeroSection;
