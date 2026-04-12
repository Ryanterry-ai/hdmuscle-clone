"use client";

import Image from "next/image";

const badges = [
  { 
    src: "/images/downloaded/badge-heavy-metals.jpg", 
    alt: "Heavy Metals Tested" 
  },
  { 
    src: "/images/downloaded/badge-formulas.jpg", 
    alt: "Clinical Formulas" 
  },
  { 
    src: "/images/downloaded/badge-no-dyes.jpg", 
    alt: "No Artificial Dyes" 
  },
  { 
    src: "/images/downloaded/badge-3rdparty.jpg", 
    alt: "Third Party Tested" 
  },
  { 
    src: "/images/downloaded/badge-dosed.jpg", 
    alt: "Properly Dosed" 
  },
  { 
    src: "/images/downloaded/badge-registered.jpg", 
    alt: "Registered & Certified" 
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-white py-6 md:py-8 border-b border-[#e5e5e5]">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="relative w-[80px] md:w-[100px] h-[40px] md:h-[50px]"
            >
              <Image 
                src={badge.src}
                alt={badge.alt}
                width={100}
                height={50}
                className="object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}