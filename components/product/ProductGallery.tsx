"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 border-2 transition-all ${
              selectedIndex === index
                ? "border-[#ffcc00]"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <Image
              src={image}
              alt={`${productName} ${index + 1}`}
              fill
              className="object-contain"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-square bg-[#fafafa] rounded-lg overflow-hidden">
        <Image
          src={images[selectedIndex]}
          alt={productName}
          fill
          className="object-contain p-4"
          priority
        />
      </div>
    </div>
  );
}