'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  handle: string;
  title: string;
  brandName: string;
  mrp: number;
  salePrice: number;
  mainImage: string;
  discountPercent: number;
  badges?: string[];
}

export default function ProductCard({
  handle,
  title,
  brandName,
  mrp,
  salePrice,
  mainImage,
  discountPercent,
  badges = [],
}: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-xl border border-border-light overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover">
      <Link href={`/product/${handle}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-light-bg">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-text-muted text-sm">No image</span>
            </div>
          )}
          {discountPercent > 0 && (
            <span className="badge-sale absolute top-3 left-3">
              {discountPercent}% OFF
            </span>
          )}
          {badges.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-uppercase ${
                    badge === 'bestseller'
                      ? 'badge-best-seller'
                      : badge === 'new'
                      ? 'badge-new'
                      : 'badge-authentic'
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-muted mb-1">{brandName}</p>
        <Link href={`/product/${handle}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ₹{salePrice.toLocaleString('en-IN')}
          </span>
          {mrp > salePrice && (
            <span className="text-xs sm:text-sm text-text-muted line-through">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <button
          className="btn-filled w-full text-xs sm:text-sm py-2"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
