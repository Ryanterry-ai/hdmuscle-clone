import type { Metadata } from 'next';
import ContactContent from '@/components/sections/ContactContent';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with DigiAgency for a free consultation. Contact us for website development, mobile apps, SEO, and digital marketing services.',
};

export default function ContactPage() {
  return <ContactContent />;
}
