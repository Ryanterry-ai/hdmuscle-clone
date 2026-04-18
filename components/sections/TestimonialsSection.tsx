'use client';

import { CMSSection, CMSSectionContent } from '@/lib/cms';
import { SectionWrapper, SectionTitle } from './SectionWrapper';

interface TestimonialsSectionProps {
  section: CMSSection;
}

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <StarRating rating={testimonial.rating || 5} />
      <blockquote className="text-gray-700 mb-6 italic">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="flex items-center">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
            <span className="text-xl font-bold text-gray-600">
              {testimonial.author.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{testimonial.author}</p>
          {testimonial.role && (
            <p className="text-sm text-gray-500">{testimonial.role}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection({ section }: TestimonialsSectionProps) {
  const content = section.content as CMSSectionContent;
  const testimonials: Testimonial[] = content.testimonials || [];

  return (
    <SectionWrapper section={section} className="bg-gray-50">
      <SectionTitle title={content.title} subtitle={content.subtitle} />
      {testimonials.length > 0 ? (
        <div className={`grid gap-6 ${
          testimonials.length === 1
            ? 'grid-cols-1 max-w-2xl mx-auto'
            : testimonials.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No testimonials available at the moment
        </div>
      )}
    </SectionWrapper>
  );
}

export default TestimonialsSection;
