import Link from 'next/link';

interface CategoryTileProps {
  name: string;
  slug: string;
  productCount: number;
  icon?: string;
}

export default function CategoryTile({
  name,
  slug,
  productCount,
  icon = '🏷️',
}: CategoryTileProps) {
  return (
    <Link href={`/category/${slug}`}>
      <div className="group bg-white rounded-xl border border-border-light p-4 sm:p-6 transition-all duration-300 hover:bg-primary/5 hover:border-primary/30 cursor-pointer">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
              {name}
            </h3>
            <p className="text-xs sm:text-sm text-text-muted">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
