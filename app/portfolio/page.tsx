import type { Metadata } from 'next';
import PortfolioContent from '@/components/sections/PortfolioContent';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'See our success stories. Browse through our portfolio of websites, mobile apps, and digital marketing projects that delivered real results for our clients.',
};

export default function PortfolioPage() {
  return <PortfolioContent />;
}
