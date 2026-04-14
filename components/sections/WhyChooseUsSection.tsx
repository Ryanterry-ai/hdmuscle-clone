'use client';

import { Icons } from '@/components/ui/Icons';
import Card from '@/components/ui/Card';
import { whyChooseUs } from '@/lib/data';

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Icons.Zap className="w-6 h-6" />,
  Sparkles: <Icons.Sparkles className="w-6 h-6" />,
  Wallet: <Icons.Wallet className="w-6 h-6" />,
  Headphones: <Icons.Headphones className="w-6 h-6" />,
};

export default function WhyChooseUsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="heading-2 text-dark-900 mt-3 mb-6">
              The Agency That Actually Delivers
            </h2>
            <p className="subheading text-dark-600 mb-8">
              We don&apos;t just build websites — we build growth engines for your business. Here&apos;s what sets us apart from the competition.
            </p>
            
            <div className="space-y-6">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                    {iconMap[item.icon]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-dark-900 mb-1">{item.title}</h3>
                    <p className="text-dark-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-3xl" />
            <div className="relative bg-gradient-to-br from-dark-900 to-dark-800 rounded-3xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-bold text-gradient mb-2">7</div>
                  <div className="text-sm text-dark-400">Days Avg. Delivery</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-bold text-gradient mb-2">150+</div>
                  <div className="text-sm text-dark-400">Happy Clients</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-bold text-gradient mb-2">200+</div>
                  <div className="text-sm text-dark-400">Projects Done</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl">
                  <div className="text-4xl font-bold text-gradient mb-2">98%</div>
                  <div className="text-sm text-dark-400">Satisfaction</div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <Icons.Shield className="w-10 h-10 text-primary-400" />
                  <div>
                    <h4 className="font-semibold">100% Satisfaction Guarantee</h4>
                    <p className="text-sm text-dark-400">Not happy? We&apos;ll make it right or refund your money.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
