'use client';

import { CMSSection, CMSSectionContent } from '@/lib/cms';

interface AnnouncementBarProps {
  section: CMSSection;
}

export function AnnouncementBar({ section }: AnnouncementBarProps) {
  const content = section.content as CMSSectionContent;

  return (
    <div
      className="bg-gray-900 text-white py-2 px-4"
      style={{ backgroundColor: content.background_color || undefined }}
      data-section-type="announcement_bar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <p className="text-sm font-medium">
          {content.text || content.headline}
          {content.cta_text && content.cta_link && (
            <a
              href={content.cta_link}
              className="ml-2 underline hover:no-underline"
            >
              {content.cta_text}
            </a>
          )}
        </p>
      </div>
    </div>
  );
}

export default AnnouncementBar;
