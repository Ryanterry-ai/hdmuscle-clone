import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm py-3 sm:py-4 overflow-x-auto scrollbar-hide">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1 flex-shrink-0">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-text-muted mx-1" />
          )}
          {index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-text-muted hover:text-primary transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium whitespace-nowrap">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
