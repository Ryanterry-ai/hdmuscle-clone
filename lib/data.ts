export interface Product {
  id: number;
  name: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  images: string[];
  category: string;
  status: string;
  flavors: string[];
  weight: string;
  servings: string;
}

export const products: Product[] = [];

export const WHATSAPP_NUMBER = '919557513017';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CONTACT_INFO = {
  name: 'Bijendra',
  email: 'bijendra0509@gmail.com',
  phone: '+91 95575 13017',
  address: 'A-7, Anand Kunj, Birjapur, Mathura, Uttar Pradesh - 281001',
};

export const services = [
  {
    id: 'web-development',
    title: 'Website Development',
    description: 'Custom business websites, landing pages, and eCommerce solutions that convert visitors into customers.',
    icon: 'Globe',
    benefits: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Easy to Manage'],
    useCases: ['Business Websites', 'Landing Pages', 'E-commerce Stores', 'Portfolios'],
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Development',
    description: 'Native and cross-platform apps for Android & iOS that deliver exceptional user experiences.',
    icon: 'Smartphone',
    benefits: ['iOS & Android', 'Native Performance', 'Offline Support', 'Push Notifications'],
    useCases: ['E-commerce Apps', 'Business Apps', 'Booking Systems', 'Customer Apps'],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'User-centered designs that enhance engagement, usability, and conversion rates.',
    icon: 'Palette',
    benefits: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    useCases: ['App Design', 'Website Redesign', 'Brand Identity', 'Design Audit'],
  },
  {
    id: 'seo',
    title: 'SEO & Digital Marketing',
    description: 'Data-driven strategies to improve your visibility and drive organic traffic.',
    icon: 'TrendingUp',
    benefits: ['Keyword Research', 'On-page SEO', 'Content Strategy', 'Analytics'],
    useCases: ['Local SEO', 'Technical SEO', 'Content Marketing', 'PPC Campaigns'],
  },
  {
    id: 'automation',
    title: 'Business Automation',
    description: 'Streamline your operations with WhatsApp automation, CRM systems, and lead management.',
    icon: 'Zap',
    benefits: ['WhatsApp Automation', 'CRM Integration', 'Lead Capture', 'Auto Follow-ups'],
    useCases: ['Lead Generation', 'Customer Support', 'Sales Funnels', 'Reporting'],
  },
];

export const pricingPlans = [
  {
    name: 'Starter',
    price: '5K',
    priceEnd: '-10K',
    description: 'Perfect for startups and small businesses needing an online presence.',
    features: [
      '5 Page Responsive Website',
      'Mobile-First Design',
      'Contact Form Integration',
      'Basic SEO Setup',
      'Social Media Links',
      '1 Month Support',
    ],
    popular: false,
  },
  {
    name: 'Growth',
    price: '10K',
    priceEnd: '-25K',
    description: 'Complete business solution with SEO and marketing foundation.',
    features: [
      '10 Page Responsive Website',
      'Advanced SEO Optimization',
      'Lead Capture Forms',
      'Google My Business Setup',
      'Social Media Integration',
      'WhatsApp Integration',
      '3 Months Support',
      'Monthly Analytics Report',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: '25K',
    priceEnd: '+',
    description: 'Full digital solution with website, app, and automation.',
    features: [
      'Unlimited Pages Website',
      'Android & iOS App',
      'Business Automation',
      'CRM Integration',
      'WhatsApp Business API',
      'Advanced Analytics Dashboard',
      'Priority Support (12 Months)',
      'Quarterly Strategy Reviews',
      'Dedicated Account Manager',
    ],
    popular: false,
  },
];

export const testimonials = [
  {
    name: 'Rajesh Sharma',
    business: 'Sharma Electronics, Mumbai',
    quote: 'Our online sales increased by 300% after they built our e-commerce website. Professional team, on-time delivery!',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    business: 'FitLife Gym, Ahmedabad',
    quote: 'The mobile app they created for our gym has made member management so much easier. Great communication throughout.',
    rating: 5,
  },
  {
    name: 'Amit Kumar',
    business: 'TechServ Solutions, Bangalore',
    quote: 'Their SEO work put us on page 1 of Google. We now get 50+ qualified leads every month from organic search.',
    rating: 5,
  },
];

export const stats = [
  { value: '200+', label: 'Projects Delivered' },
  { value: '150+', label: 'Happy Clients' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '5+', label: 'Years Experience' },
];

export const portfolio = [
  {
    title: 'MumbaiRestaurants.com',
    category: 'Web Development',
    description: 'Restaurant discovery platform with online ordering',
    results: ['500+ restaurants onboarded', '10K+ monthly visitors', '₹2L+ monthly orders'],
  },
  {
    title: 'FitLife Gym App',
    category: 'Mobile App',
    description: 'Fitness tracking and member management app',
    results: ['5K+ downloads', '4.8 app rating', '40% member retention'],
  },
  {
    title: 'AutoParts E-commerce',
    category: 'E-commerce',
    description: 'Complete auto parts online store',
    results: ['₹50L+ sales in first year', '500+ products', 'Same-day delivery'],
  },
  {
    title: 'LocalBazaar SEO',
    category: 'Digital Marketing',
    description: 'Local business directory with SEO optimization',
    results: ['Page 1 rankings', '20K+ organic traffic', '300% lead increase'],
  },
];

export const whyChooseUs = [
  {
    title: 'Lightning Fast Delivery',
    description: 'Get your website live in as little as 7 days. We value your time.',
    icon: 'Zap',
  },
  {
    title: 'Premium Quality',
    description: 'Clean code, modern design, and pixel-perfect implementation every time.',
    icon: 'Sparkles',
  },
  {
    title: 'Affordable Pricing',
    description: 'Enterprise-quality work at prices that fit your budget. No hidden costs.',
    icon: 'Wallet',
  },
  {
    title: 'Dedicated Support',
    description: '24/7 support during development. We\'re always here when you need us.',
    icon: 'Headphones',
  },
];

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];
