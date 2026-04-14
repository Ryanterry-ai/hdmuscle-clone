'use client';

import { useState } from 'react';
import { Icons } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { WHATSAPP_URL, CONTACT_INFO } from '@/lib/data';

const businessTypes = [
  'Retail / E-commerce',
  'Restaurant / Food Business',
  'Salon / Beauty',
  'Healthcare / Clinic',
  'Real Estate',
  'Education / Training',
  'Professional Services',
  'Other',
];

export default function ContactContent() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="heading-1 text-white mb-6">
              Let&apos;s <span className="text-gradient">Talk</span>
            </h1>
            <p className="subheading text-dark-400">
              Have a project in mind? Get a free consultation and let&apos;s discuss how we can help your business grow.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <div>
              <h2 className="heading-3 text-dark-900 mb-6">Send Us a Message</h2>
              
              {submitted ? (
                <Card className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Icons.CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">Thank You!</h3>
                  <p className="text-dark-600 mb-6">
                    We&apos;ve received your message and will get back to you within 24 hours.
                  </p>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-green-500 hover:bg-green-600">
                      <Icons.MessageCircle className="w-4 h-4 mr-2" />
                      Chat on WhatsApp for Faster Response
                    </Button>
                  </a>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Rajesh Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="rajesh@business.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-2">
                        Business Type *
                      </label>
                      <select
                        name="businessType"
                        required
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select your business</option>
                        {businessTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Tell Us About Your Project *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                      placeholder="Describe your project requirements, goals, and timeline..."
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                    {!isSubmitting && <Icons.Send className="w-5 h-5 mr-2" />}
                    Send Message
                  </Button>
                  
                  <p className="text-sm text-dark-500 text-center">
                    Or contact us directly on{' '}
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      WhatsApp
                    </a>{' '}
                    for instant response
                  </p>
                </form>
              )}
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="heading-3 text-dark-900 mb-6">Quick Contact</h2>
                <div className="space-y-4">
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <Icons.Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900">Call Us</h3>
                        <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`} className="text-dark-600 hover:text-primary-600 transition-colors">
                          {CONTACT_INFO.phone}
                        </a>
                        <p className="text-sm text-dark-500 mt-1">Mon-Sat, 9AM - 7PM</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <Icons.MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900">WhatsApp</h3>
                        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-dark-600 hover:text-primary-600 transition-colors">
                          Chat with us
                        </a>
                        <p className="text-sm text-dark-500 mt-1">Fastest way to reach us</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600 flex-shrink-0">
                        <Icons.Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900">Email</h3>
                        <a href={`mailto:${CONTACT_INFO.email}`} className="text-dark-600 hover:text-primary-600 transition-colors">
                          {CONTACT_INFO.email}
                        </a>
                        <p className="text-sm text-dark-500 mt-1">We reply within 24 hours</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <Icons.MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900">Office</h3>
                        <p className="text-dark-600">
                          {CONTACT_INFO.address}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              
              <Card className="p-6 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
                <div className="flex items-center space-x-4 mb-4">
                  <Icons.Clock className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold">Response Time Guarantee</h3>
                    <p className="text-white/80 text-sm">We respond to all inquiries within 2 hours</p>
                  </div>
                </div>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-white text-primary-600 hover:bg-gray-100">
                    <Icons.MessageCircle className="w-5 h-5 mr-2" />
                    Start Chat Now
                  </Button>
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <section className="h-80 bg-dark-800 relative">
        <div className="absolute inset-0 flex items-center justify-center text-dark-600">
          <div className="text-center">
            <Icons.MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Google Maps Embed - Mathura, UP</p>
          </div>
        </div>
      </section>
    </>
  );
}
