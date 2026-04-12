"use client";

import Image from "next/image";

const badges = [
  { 
    src: "https://hdmuscle.com/cdn/shop/files/HeavyMetals.jpg?v=1685721934&width=500", 
    alt: "Heavy Metals Tested" 
  },
  { 
    src: "https://hdmuscle.com/cdn/shop/files/formulas_95b0297a-d75a-411b-aa37-3f79d3f7c711.jpg?v=1683863231&width=500", 
    alt: "Clinical Formulas" 
  },
  { 
    src: "https://hdmuscle.com/cdn/shop/files/NoDyes.jpg?v=1683863250&width=500", 
    alt: "No Artificial Dyes" 
  },
  { 
    src: "https://hdmuscle.com/cdn/shop/files/3rdParty.jpg?v=1683863268&width=500", 
    alt: "Third Party Tested" 
  },
  { 
    src: "https://hdmuscle.com/cdn/shop/files/Properlydosed.jpg?v=1683863217&width=500", 
    alt: "Properly Dosed" 
  },
  { 
    src: "https://hdmuscle.com/cdn/shop/files/Registered.jpg?v=1684256512&width=500", 
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