'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { pricingPlans, WHATSAPP_URL } from '@/lib/data';

export default function PricingContent() {
  return (
    <>
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="heading-1 text-white mb-6">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h1>
            <p className="subheading text-dark-400">
              No hidden fees, no surprises. Choose the package that fits your budget and goals.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden ${
                  plan.popular ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-semibold px-4 py-1 rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-dark-900 mb-2">{plan.name}</h3>
                  <p className="text-dark-600 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-dark-900">₹{plan.price}</span>
                    <span className="text-dark-500">{plan.priceEnd}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-dark-700">
                        <Icons.CheckCircle className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/contact" className="block">
                    <Button
                      variant={plan.popular ? 'gradient' : 'outline'}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-3 text-dark-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept UPI, Bank Transfer, Credit/Debit Cards, and partial EMI options for larger projects.',
                },
                {
                  q: 'Is there a refund policy?',
                  a: 'Yes! If you&apos;re not satisfied with our work within the first 15 days, we offer a full refund (minus transaction fees).',
                },
                {
                  q: 'How long does a typical project take?',
                  a: 'Starter packages: 7-14 days. Growth packages: 2-4 weeks. Premium packages: 4-8 weeks.',
                },
                {
                  q: 'Do you provide post-launch support?',
                  a: 'Yes! All packages include free support period. Premium clients get dedicated support for 12 months.',
                },
                {
                  q: 'Can I upgrade my package later?',
                  a: 'Absolutely! You can upgrade at any time. We&apos;ll prorate the difference and get you set up quickly.',
                },
              ].map((faq, index) => (
                <Card key={index} className="p-6">
                  <h4 className="font-semibold text-dark-900 mb-2 flex items-center">
                    <Icons.ChevronRight className="w-5 h-5 text-primary-500 mr-2" />
                    {faq.q}
                  </h4>
                  <p className="text-dark-600 text-sm pl-7" dangerouslySetInnerHTML={{ __html: faq.a }} />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="heading-2 mb-6">
              Still Have Questions?
            </h2>
            <p className="subheading text-white/80 mb-8">
              Get a personalized quote and recommendations. No obligation, just honest advice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Get Custom Quote
                </Button>
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Icons.MessageCircle className="w-5 h-5 mr-2" />
                  Chat Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
