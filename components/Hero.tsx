"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] mt-[105px] md:mt-[125px]">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <Image 
          src="/images/downloaded/hero.jpg"
          alt="HD Muscle Supplements"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content - left side only */}
      <div className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2">
        <Link 
          href="https://hdmuscle.com/collections/pre-workouts"
          className="inline-block bg-[#1d1d1d] text-white px-8 py-3 font-oswald text-lg md:text-xl font-bold uppercase tracking-wider"
        >
          FIND YOUR FORMULA
        </Link>
      </div>
    </section>
  );
}