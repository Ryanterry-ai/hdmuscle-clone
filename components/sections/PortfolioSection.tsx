'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { portfolio } from '@/lib/data';

export default function PortfolioSection() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Work</span>
          <h2 className="heading-2 text-dark-900 mt-3 mb-4">
            Results That Speak for Themselves
          </h2>
          <p className="subheading text-dark-600">
            See how we&apos;ve helped businesses like yours achieve their digital goals and drive real growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {portfolio.map((project, index) => (
            <Card key={index} hover className="group overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-dark-800 to-dark-900 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
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
                <p className="text-dark-600 mb-4">{project.description}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-dark-700">Key Results:</h4>
                  {project.results.map((result, i) => (
                    <div key={i} className="flex items-center text-sm text-dark-600">
                      <Icons.CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/portfolio">
            <Button size="lg" variant="outline">
              View All Projects
              <Icons.ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
