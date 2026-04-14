import type { Metadata } from 'next';
import AboutContent from '@/components/sections/AboutContent';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about DigiAgency - a premium yet affordable digital solutions company helping local businesses grow online with websites, apps, and lead generation systems.',
};

export default function AboutPage() {
  return <AboutContent />;
}
