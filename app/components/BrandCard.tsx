import Link from 'next/link';
import Image from 'next/image';

interface BrandCardProps {
  name: string;
  slug: string;
  description: string;
  productCount: number;
  logo: string;
}

export default function BrandCard({
  name,
  slug,
  description,
  productCount,
  logo,
}: BrandCardProps) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/brand/${slug}`}>
      <div className="group bg-white rounded-xl border border-border-light p-4 sm:p-6 transition-all duration-300 hover:border-primary hover:shadow-glow-green-sm cursor-pointer">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-light-bg flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
            {logo ? (
              <Image
                src={logo}
                alt={name}
                width={80}
                height={80}
                className="object-contain"
              />
            ) : (
              <span className="text-lg sm:text-xl font-bold text-primary">
                {initials}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mb-2 line-clamp-2">
            {description}
          </p>
          <p className="text-xs text-text-muted">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </p>
          <span className="mt-3 text-xs sm:text-sm font-semibold text-primary uppercase tracking-uppercase">
            Shop Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
