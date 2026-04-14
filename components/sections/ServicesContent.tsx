'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { services, WHATSAPP_URL } from '@/lib/data';

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Icons.Globe className="w-10 h-10" />,
  Smartphone: <Icons.Smartphone className="w-10 h-10" />,
  Palette: <Icons.Palette className="w-10 h-10" />,
  TrendingUp: <Icons.TrendingUp className="w-10 h-10" />,
  Zap: <Icons.Zap className="w-10 h-10" />,
};

export default function ServicesContent() {
  return (
    <>
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="heading-1 text-white mb-6">
              Our <span className="text-gradient">Services</span>
            </h1>
            <p className="subheading text-dark-400">
              Complete digital solutions tailored for your business growth. From websites to apps, we&apos;ve got you covered.
            </p>
          </div>
        </div>
      </section>

      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`section-padding ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          <div className="container-custom">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-primary-600 mb-6">
                  {iconMap[service.icon]}
                </div>
                <h2 className="heading-3 text-dark-900 mb-4">{service.title}</h2>
                <p className="text-dark-600 mb-6">{service.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-dark-700 mb-3 uppercase tracking-wider">What You Get:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {service.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center text-dark-600">
                        <Icons.CheckCircle className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-dark-700 mb-3 uppercase tracking-wider">Perfect For:</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.useCases.map((useCase, i) => (
                      <span key={i} className="px-3 py-1 bg-dark-100 text-dark-700 text-sm rounded-full">
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/contact">
                    <Button>
                      Get Started
                      <Icons.ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <Icons.MessageCircle className="w-4 h-4 mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
              
              <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-dark-800 to-dark-900 rounded-3xl p-8 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="mb-4">{iconMap[service.icon]}</div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-dark-400 text-sm">Starting from ₹5,000</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                  <Icons.ArrowUpRight className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 text-dark-900 mb-4">
              Not Sure What You Need?
            </h2>
            <p className="subheading text-dark-600">
              Let&apos;s have a quick chat. We&apos;ll analyze your business and recommend the perfect solution for your goals and budget.
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="p-8 text-center">
              <Icons.MessageSquare className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-900 mb-2">Free Consultation</h3>
              <p className="text-dark-600 mb-6">
                Get personalized recommendations and a custom quote — at no cost.
              </p>
              <Link href="/contact">
                <Button className="w-full">
                  Book Your Free Call
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
