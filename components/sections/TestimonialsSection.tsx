'use client';

import { Icons } from '@/components/ui/Icons';
import Card from '@/components/ui/Card';
import { testimonials } from '@/lib/data';

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="heading-2 text-dark-900 mt-3 mb-4">
            What Our Clients Say
          </h2>
          <p className="subheading text-dark-600">
            Don&apos;t just take our word for it — hear from business owners who&apos;ve transformed their online presence with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <div className="absolute -top-4 left-8">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <Icons.Quote className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="p-8 pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Icons.Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-dark-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-900">{testimonial.name}</h4>
                    <p className="text-sm text-dark-500">{testimonial.business}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Icons.MessageCircle className="w-10 h-10 text-primary-600" />
              <div>
                <h4 className="font-semibold text-dark-900">Ready to join them?</h4>
                <p className="text-dark-600">Get a free consultation and see how we can help your business grow.</p>
              </div>
            </div>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <button className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                Start Your Project
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
