'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { portfolio, WHATSAPP_URL } from '@/lib/data';

const categories = ['All', 'Web Development', 'Mobile App', 'E-commerce', 'Digital Marketing'];

export default function PortfolioContent() {
  return (
    <>
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="heading-1 text-white mb-6">
              Our <span className="text-gradient">Work</span>
            </h1>
            <p className="subheading text-dark-400">
              Real projects, real results. See how we&apos;ve helped businesses across India achieve their digital goals.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-dark-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {portfolio.map((project, index) => (
              <Card key={index} className="overflow-hidden group">
                <div className="aspect-video bg-gradient-to-br from-dark-800 to-dark-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icons.ExternalLink className="w-8 h-8 text-white/50" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-dark-900 mb-2">{project.title}</h3>
                  <p className="text-dark-600 mb-6">{project.description}</p>
                  
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-semibold text-dark-700 mb-3 flex items-center">
                      <Icons.TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                      Results Achieved
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {project.results.map((result, i) => (
                        <div key={i} className="text-center">
                          <div className="text-sm font-semibold text-dark-900">
                            {result.split(' ')[0]}
                          </div>
                          <div className="text-xs text-dark-500">
                            {result.split(' ').slice(1).join(' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 text-dark-900 mb-4">
              Want to Be Our Next Success Story?
            </h2>
            <p className="subheading text-dark-600">
              Let&apos;s discuss your project and create something amazing together.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg">
                Start Your Project
                <Icons.ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                <Icons.MessageCircle className="w-5 h-5 mr-2" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
