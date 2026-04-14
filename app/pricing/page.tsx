import type { Metadata } from 'next';
import PricingContent from '@/components/sections/PricingContent';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Transparent pricing for all budgets. Choose from our Starter, Growth, and Premium packages for website development, mobile apps, and digital marketing services.',
};

export default function PricingPage() {
  return <PricingContent />;
}
