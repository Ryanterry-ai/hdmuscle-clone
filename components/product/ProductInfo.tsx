"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/data";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors[0]);
  const [quantity, setQuantity] = useState(1);

  const inrPrice = product.price * 92.5;

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <h1 className="font-oswald text-3xl md:text-4xl font-bold text-[#1d1d1d]">
        {product.name}
      </h1>

      {/* Price */}
      <div className="text-2xl font-bold text-[#1d1d1d]">
        {formatPrice(inrPrice)}
      </div>

      {/* Flavor Selection */}
      <div>
        <label className="block text-sm font-medium text-[#737373] mb-2">
          Flavor: <span className="text-[#1d1d1d]">{selectedFlavor}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {product.flavors.map((flavor) => (
            <button
              key={flavor}
              onClick={() => setSelectedFlavor(flavor)}
              className={`px-4 py-2 border-2 transition-all ${
                selectedFlavor === flavor
                  ? "border-[#1d1d1d] bg-[#1d1d1d] text-white"
                  : "border-gray-300 hover:border-[#1d1d1d]"
              }`}
            >
              {flavor}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-[#737373] mb-2">Quantity</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 border-2 border-gray-300 flex items-center justify-center hover:border-[#1d1d1d]"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 border-2 border-gray-300 flex items-center justify-center hover:border-[#1d1d1d]"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <a
        href={`https://hdmuscle.com/products/${product.handle}`}
        className="w-full bg-[#1d1d1d] text-white py-4 font-oswald text-lg font-bold text-center uppercase hover:bg-[#ffcc00] hover:text-black transition-all"
      >
        Add to Cart
      </a>

      {/* Trust Badges */}
      <div className="flex flex-wrap gap-4 justify-center pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-[#737373]">
          <Image
            src="/images/downloaded/badge-heavymetals.png"
            alt="Heavy Metals Tested"
            width={60}
            height={30}
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#737373]">
          <Image
            src="/images/downloaded/badge-formulas.png"
            alt="Clinical Formulas"
            width={60}
            height={30}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}