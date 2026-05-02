import {
  Shield,
  FlaskConical,
  Truck,
  RotateCcw,
  CreditCard,
} from 'lucide-react';

const trustBadges = [
  { icon: Shield, label: '100% Authentic' },
  { icon: FlaskConical, label: 'Lab Tested' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: RotateCcw, label: 'Easy Returns' },
  { icon: CreditCard, label: 'Secure Payment' },
];

export default function TrustBadges() {
  return (
    <div className="w-full bg-light-bg border-y border-border-light py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-hide pb-1 sm:pb-0 sm:justify-center">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="trust-badge flex-shrink-0"
            >
              <badge.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap text-xs sm:text-sm">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
