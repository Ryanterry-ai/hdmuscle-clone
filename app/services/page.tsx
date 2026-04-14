import type { Metadata } from 'next';
import ServicesContent from '@/components/sections/ServicesContent';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore our comprehensive digital services including website development, mobile app development, UI/UX design, SEO optimization, and business automation solutions.',
};

export default function ServicesPage() {
  return <ServicesContent />;
}
