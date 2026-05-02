export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Building2, Users, Phone, Mail, Truck, ShieldCheck, Clock, FileText, BadgeCheck } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

const pricingTiers = [
  { tier: 'Gym Owner', minQty: '10+ units', discount: '15-25%', benefits: 'Bulk pricing for fitness centers' },
  { tier: 'Retailer', minQty: '50+ units', discount: '20-35%', benefits: 'Competitive retail margins' },
  { tier: 'Wholesaler', minQty: '200+ units', discount: '30-45%', benefits: 'Maximum volume discounts' },
  { tier: 'Distributor', minQty: '500+ units', discount: '40-55%', benefits: 'Exclusive territorial rights' },
];

const benefits = [
  { icon: BadgeCheck, title: 'Bulk Pricing', desc: 'Competitive pricing tiers based on order volume' },
  { icon: Users, title: 'Dedicated Account Manager', desc: 'Personal support for your business needs' },
  { icon: Truck, title: 'Priority Shipping', desc: 'Fast delivery with order tracking' },
  { icon: FileText, title: 'GST Invoices', desc: 'Proper tax documentation for B2B compliance' },
  { icon: ShieldCheck, title: 'Authentic Products', desc: '100% genuine products with warranty' },
  { icon: Clock, title: 'Flexible Payments', desc: 'Credit terms available for qualified partners' },
];

export default function WholesalePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-dark-bg text-white py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Wholesale & Distribution', href: '/wholesale' },
          ]} />
          <div className="flex items-center gap-4 mt-2">
            <Building2 className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Wholesale & Distributor Partnership</h1>
              <p className="text-text-light mt-3 text-lg max-w-2xl">
                Partner with Upgraded.co.in for exclusive B2B pricing, dedicated support, and premium supplement distribution opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-light-bg py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Wholesale Pricing Tiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {pricingTiers.map((tier, i) => (
              <div key={i} className="bg-white rounded-xl border-2 border-border-light p-6 text-center hover:border-primary transition-colors">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{tier.tier}</h3>
                <p className="text-3xl font-bold text-primary mb-1">{tier.discount}</p>
                <p className="text-sm text-text-muted mb-3">OFF</p>
                <div className="pt-3 border-t border-border-light">
                  <p className="text-sm text-gray-900 font-semibold">Min: {tier.minQty}</p>
                  <p className="text-xs text-text-muted mt-1">{tier.benefits}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Partnership Benefits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-light-bg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-light-bg py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">Become a Partner</h2>
            <p className="text-text-muted text-center mb-8">Fill out the form below and our team will contact you within 24 hours.</p>

            <form action="/api/wholesale-inquiry" method="POST" className="bg-white rounded-xl border border-border-light p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    required
                    className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-semibold text-gray-900 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    required
                    className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="business@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-semibold text-gray-900 mb-2">
                  Business Type *
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  required
                  className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:outline-none focus:border-primary transition-colors bg-white"
                >
                  <option value="">Select Business Type</option>
                  <option value="Gym">Gym Owner</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-border-light rounded-lg focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Tell us about your business and requirements..."
                ></textarea>
              </div>

              <button type="submit" className="btn-filled w-full py-3 text-base">
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-dark-bg text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="text-sm">100% Authentic Products</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-primary" />
              <span className="text-sm">Pan-India Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm">GST Billing Available</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-sm">Dedicated Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

