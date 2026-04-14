'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import Button from '@/components/ui/Button';
import { stats, WHATSAPP_URL, CONTACT_INFO } from '@/lib/data';

const team = [
  { name: 'Bijendra', role: 'Founder & CEO', initials: 'B' },
  { name: 'Design Team', role: 'UI/UX Designers', initials: 'D' },
  { name: 'Dev Team', role: 'Web & App Developers', initials: 'D' },
  { name: 'Marketing Team', role: 'SEO & Growth Experts', initials: 'M' },
];

const values = [
  {
    icon: Icons.Target,
    title: 'Client Success First',
    description: 'Your success is our success. We measure our performance by the results we deliver to our clients.',
  },
  {
    icon: Icons.Sparkles,
    title: 'Quality Without Compromise',
    description: 'We never cut corners. Every project receives our full attention and expertise, regardless of size.',
  },
  {
    icon: Icons.Headphones,
    title: 'Transparent Communication',
    description: 'No hidden fees, no surprises. We keep you informed at every step of the journey.',
  },
  {
    icon: Icons.Rocket,
    title: 'Innovation-Driven',
    description: 'We stay ahead of trends to bring you the latest and most effective digital solutions.',
  },
];

export default function AboutContent() {
  return (
    <>
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="heading-1 text-white mb-6">
              About <span className="text-gradient">DigiAgency</span>
            </h1>
            <p className="subheading text-dark-400">
              We&apos;re a team of passionate digital experts dedicated to helping local businesses thrive in the online world.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="heading-2 text-dark-900 mt-3 mb-6">
                From a Small Startup to 150+ Happy Clients
              </h2>
              <div className="space-y-4 text-dark-600">
                <p>
                  DigiAgency was founded in 2021 with a simple mission: to make professional digital services accessible to every local business in India.
                </p>
                <p>
                  We started as a two-person team working from a small office, helping neighborhood shops build their first websites. Today, we&apos;ve grown into a full-service digital agency with 15+ team members and 150+ successful projects across industries.
                </p>
                <p>
                  What hasn&apos;t changed is our core belief: every business deserves a powerful online presence, regardless of size or budget. That&apos;s why we offer flexible pricing and tailor-made solutions for each client.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-3xl" />
              <div className="relative bg-gradient-to-br from-dark-900 to-dark-800 rounded-3xl p-8 text-white">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mx-auto mb-4 flex items-center justify-center">
                    <Icons.Building2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Est. 2021</h3>
                  <p className="text-dark-400">Mumbai, India</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                      <div className="text-xs text-dark-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Mission & Vision</span>
            <h2 className="heading-2 text-dark-900 mt-3 mb-4">
              What Drives Us Forward
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 mb-6">
                <Icons.Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-4">Our Mission</h3>
              <p className="text-dark-600">
                To empower local businesses with affordable, high-quality digital solutions that drive real growth and help them compete in the digital economy.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600 mb-6">
                <Icons.Eye className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-4">Our Vision</h3>
              <p className="text-dark-600">
                To become India&apos;s most trusted digital partner for SMEs, recognized for excellence in delivery, innovation, and client success.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="heading-2 text-dark-900 mt-3 mb-4">
              Meet the Experts Behind Your Success
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold group-hover:scale-105 transition-transform">
                  {member.initials}
                </div>
                <h3 className="text-lg font-semibold text-dark-900">{member.name}</h3>
                <p className="text-dark-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="heading-2 text-dark-900 mt-3 mb-4">
              The Principles We Live By
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-primary-600 mb-4">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-dark-900 mb-2">{value.title}</h3>
                <p className="text-sm text-dark-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="heading-2 mb-6">
              Ready to Work With Us?
            </h2>
            <p className="subheading text-white/80 mb-8">
              Let&apos;s discuss your project and see how we can help your business grow. Book a free consultation today!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Get In Touch
                </Button>
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Icons.MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
