'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { services } from '@/lib/data';

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Icons.Globe className="w-8 h-8" />,
  Smartphone: <Icons.Smartphone className="w-8 h-8" />,
  Palette: <Icons.Palette className="w-8 h-8" />,
  TrendingUp: <Icons.TrendingUp className="w-8 h-8" />,
  Zap: <Icons.Zap className="w-8 h-8" />,
};

export default function ServicesSection() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="heading-2 text-dark-900 mt-3 mb-4">
            Complete Digital Solutions Under One Roof
          </h2>
          <p className="subheading text-dark-600">
            From websites to apps, SEO to automation — we provide everything your business needs to thrive online.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={service.id} hover className="group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                  {iconMap[service.icon]}
                </div>
                
                <h3 className="text-xl font-bold text-dark-900 mb-3">{service.title}</h3>
                <p className="text-dark-600 mb-6">{service.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-dark-700 mb-3">What you get:</h4>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-dark-600">
                        <Icons.CheckCircle className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link href={`/services#${service.id}`}>
                  <Button variant="ghost" className="group-hover:text-primary-600 p-0">
                    Learn More
                    <Icons.ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/services">
            <Button size="lg">
              View All Services
              <Icons.ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
