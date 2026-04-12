"use client";

import { useState } from "react";
import { products } from "@/lib/data";
import ProductCard from "./ProductCard";

const PRODUCTS_PER_VIEW = 3;

export default function NewAndNoteworthy() {
  const newProducts = products.filter(p => 
    ["hydrahd", "greenshd", "prehd-essential", "pumphd"].includes(p.handle)
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const maxIndex = Math.max(0, newProducts.length - PRODUCTS_PER_VIEW);
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
    <section className="py-4 md:py-6 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* Header - Title with arrows */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-oswald text-lg md:text-xl font-bold text-[#1d1d1d] uppercase tracking-wider">
            NEW AND NOTEWORTHY ↓
          </h2>
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
        </div>

        {/* Products - Fixed 3 per view - larger grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {newProducts.slice(currentIndex, currentIndex + PRODUCTS_PER_VIEW).map((product, idx) => (
            <div key={`${product.id}-${currentIndex}-${idx}`} className="w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View all products - below gallery */}
        <div className="mt-4 text-center">
          <a 
            href="https://hdmuscle.com/collections/new-featured"
            className="font-roboto text-[13px] text-[#737373] hover:text-[#1d1d1d] transition-colors duration-300 inline-flex items-center gap-1"
          >
            View all products
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}