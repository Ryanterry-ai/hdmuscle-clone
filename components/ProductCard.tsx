"use client";

import Image from "next/image";
import { Product } from "@/lib/data";
import { formatPrice, formatPriceWithPrefix } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const reviews = ((product.id * 7) % 50) + 5;
  const secondImage = product.images?.[1];

  return (
    <a 
      href={`https://hdmuscle.com/products/${product.handle}`} 
      className="group block w-full"
    >
      <div className="relative bg-[#fafafa] overflow-hidden mb-2 transition-all duration-300 group-hover:shadow-xl group-hover:ring-1 group-hover:ring-[#e5e5e5]">
        <div className="aspect-[3/4] relative w-full">
          {/* Main Product Image */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 md:p-6 transition-transform duration-300 group-hover:scale-105 absolute inset-0"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 280px"
          />
          
          {/* Second Image (Nutrition Facts) - shows on hover */}
          {secondImage && (
            <Image
              src={secondImage}
              alt={`${product.name} Supplement Facts`}
              fill
              className="object-contain p-4 md:p-6 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 280px"
            />
          )}
        </div>
        
        {/* Discount Badge - Position based on status */}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="absolute top-2 left-2 bg-[#ffcc00] text-black text-xs font-bold px-2 py-0.5">
            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
          </span>
        )}
        
        {/* Sold out Badge */}
        {product.status === "sold-out" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-black text-xs font-bold px-3 py-1">Sold out</span>
          </div>
        )}
        
        {/* Quick Add Button - appears on hover */}
        {product.status !== "sold-out" && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#1d1d1d] text-white py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-full group-hover:translate-y-0">
            <span className="font-oswald text-xs font-bold uppercase">Add to Cart</span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="px-1">
        <h3 className="font-oswald text-xs md:text-sm font-medium text-[#1d1d1d] group-hover:text-[#ffcc00] transition-colors duration-300 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Reviews */}
        <div className="flex items-center gap-1 mt-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg 
              key={star} 
              xmlns="http://www.w3.org/2000/svg" 
              width={10} 
              height={10} 
              viewBox="0 0 24 24" 
              fill={star <= 4 ? "#f6a529" : "#d1d5db"} 
              stroke={star <= 4 ? "#f6a529" : "#d1d5db"} 
              strokeWidth={2}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          <span className="text-[10px] text-[#737373]">{reviews}</span>
        </div>
        
        {/* Price - INR format */}
        <div className="mt-1">
          {product.compareAtPrice ? (
            <div className="flex flex-col">
              <span className="text-[#1d1d1d] font-bold text-sm">{formatPrice(product.price)}</span>
              <span className="text-[#737373] line-through text-xs">{formatPrice(product.compareAtPrice)}</span>
            </div>
          ) : (
            <span className="text-[#1d1d1d] font-bold text-sm">{formatPriceWithPrefix(product.price, "From ")}</span>
          )}
        </div>
        
        {/* Status label */}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="text-xs font-bold text-[#1d1d1d]">Sale</span>
        )}
        {product.status === "sold-out" && (
          <span className="text-xs text-[#737373]">Sold out</span>
        )}
      </div>
    </a>
  );
}