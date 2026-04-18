'use client';

import { CMSSection, CMSSectionContent } from '@/lib/cms';
import { SectionWrapper, SectionTitle } from './SectionWrapper';
import { useState } from 'react';

interface FAQSectionProps {
  section: CMSSection;
}

interface FAQ {
  question: string;
  answer: string;
}

function FAQItem({ faq, isOpen, onClick }: { faq: FAQ; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-4 flex items-center justify-between text-left hover:text-red-600 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

export function FAQSection({ section }: FAQSectionProps) {
  const content = section.content as CMSSectionContent;
  const faqs: FAQ[] = content.faqs || [];
  const [openIndex, setOpenIndex] = useState<number | null>(content.allow_multiple_open ? null : -1);

  const handleToggle = (index: number) => {
    if (content.allow_multiple_open) {
      setOpenIndex(openIndex === index ? null : index);
    } else {
      setOpenIndex(openIndex === index ? -1 : index);
    }
  };

  return (
    <SectionWrapper section={section} className="bg-white">
      <SectionTitle title={content.title} subtitle={content.subtitle} />
      {faqs.length > 0 ? (
        <div className="max-w-3xl mx-auto">
          {content.layout === 'accordion' ? (
            <div className="divide-y divide-gray-200">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  isOpen={openIndex === index}
                  onClick={() => handleToggle(index)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No FAQs available at the moment
        </div>
      )}
    </SectionWrapper>
  );
}

export default FAQSection;
