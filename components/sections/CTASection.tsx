'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import { WHATSAPP_URL } from '@/lib/data';

export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-2 text-white mb-6">
            Ready to <span className="text-gradient">Transform</span> Your Business Online?
          </h2>
          <p className="subheading text-dark-400 mx-auto mb-10">
            Join 150+ businesses who&apos;ve grown their revenue with our digital solutions. Get started with a free consultation today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto">
                Get Free Consultation
                <Icons.ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                <Icons.MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Us
              </Button>
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Icons.Zap, text: '7-Day Delivery' },
              { icon: Icons.Shield, text: '100% Satisfaction' },
              { icon: Icons.Headphones, text: '24/7 Support' },
              { icon: Icons.Rocket, text: 'Launch Ready' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-center space-x-2 text-dark-400">
                <item.icon className="w-5 h-5 text-primary-400" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
