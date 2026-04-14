'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import { WHATSAPP_URL } from '@/lib/data';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-6">
              <Icons.Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">Trusted by 150+ Businesses</span>
            </div>
            
            <h1 className="heading-1 text-white mb-6">
              We Build Websites & Apps That{' '}
              <span className="text-gradient">Bring You Real Customers</span>
            </h1>
            
            <p className="subheading text-dark-400 mb-8">
              Stop losing leads to competitors. Get a powerful online presence that converts visitors into paying customers — starting at just ₹5,000.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/contact">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Free Consultation
                  <Icons.ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                  <Icons.MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Us Now
                </Button>
              </a>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-dark-900 flex items-center justify-center text-xs font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Icons.Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-dark-400">4.9/5 from 200+ reviews</p>
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block animate-slide-up">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl rotate-6 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-accent-600 rounded-3xl">
                <div className="absolute inset-4 bg-dark-800 rounded-2xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-primary-500/30 rounded w-3/4" />
                      <div className="h-4 bg-accent-500/30 rounded w-1/2" />
                      <div className="h-32 bg-dark-700 rounded-lg" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 bg-primary-500/20 rounded" />
                        <div className="h-16 bg-accent-500/20 rounded" />
                        <div className="h-16 bg-primary-500/20 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 animate-float">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Icons.TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-900">+300%</p>
                    <p className="text-xs text-dark-500">Sales Growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-dark-800">
          <p className="text-center text-dark-500 text-sm mb-8">Trusted by leading businesses across India</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-50">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 bg-dark-700 rounded" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <Icons.ChevronDown className="w-8 h-8 text-dark-500" />
      </div>
    </section>
  );
}
