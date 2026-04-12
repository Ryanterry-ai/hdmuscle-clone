"use client";

import { useState } from "react";
import { Product } from "@/lib/data";
import ProductCard from "./ProductCard";

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

const PRODUCTS_PER_VIEW = 3;

export default function ProductCarousel({ 
  products, 
  title, 
  showViewAll = false, 
  viewAllLink = "/collections/all" 
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const maxIndex = Math.max(0, products.length - PRODUCTS_PER_VIEW);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left' && canScrollLeft) {
      setCurrentIndex(prev => prev - 1);
    } else if (direction === 'right' && canScrollRight) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="relative">
      {/* Header - Title with arrows next to it */}
      {(title || showViewAll) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="font-oswald text-[22px] md:text-[26px] font-bold text-[#1d1d1d] uppercase tracking-[1px]">
              {title}
            </h2>
          )}
          {showViewAll && (
            <div className="flex items-center gap-2">
              {/* Left Arrow */}
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-7 h-7 flex items-center justify-center transition-all duration-300 ${canScrollLeft ? 'opacity-100 hover:bg-gray-100 cursor-pointer' : 'opacity-30 pointer-events-none'}`}
                aria-label="Previous products"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              
              {/* Right Arrow */}
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-7 h-7 flex items-center justify-center transition-all duration-300 ${canScrollRight ? 'opacity-100 hover:bg-gray-100 cursor-pointer' : 'opacity-30 pointer-events-none'}`}
                aria-label="Next products"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Products - Fixed 3 per view - larger grid */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {products.slice(currentIndex, currentIndex + PRODUCTS_PER_VIEW).map((product, idx) => (
          <div key={`${product.id}-${currentIndex}-${idx}`} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* View all products - below the gallery */}
      {showViewAll && (
        <div className="mt-4 text-center">
          <a 
            href={viewAllLink}
            className="font-roboto text-[13px] text-[#737373] hover:text-[#1d1d1d] transition-colors duration-300 inline-flex items-center gap-1"
          >
            View all products
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}