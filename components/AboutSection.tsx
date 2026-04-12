"use client";

import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="relative w-full py-16 md:py-24">
      <div className="absolute inset-0">
        <Image 
          src="https://hdmuscle.com/cdn/shop/files/000031460020.jpg?v=1764729480&width=2750"
          alt="About HD Muscle"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      <div className="relative max-w-[800px] mx-auto px-4 text-center">
        <h2 className="font-oswald text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-wider">
          FAMILY BUILT. PERFORMANCE DRIVEN.
        </h2>
        <p className="text-white text-base md:text-lg leading-relaxed">
          HD Muscle is a family-built, performance-driven supplement brand founded in Canada by Dorian Hamilton and his family. 
          We formulate with purpose: clinically backed ingredients, transparent labels, and products trusted by IFBB Pros and everyday athletes. 
          No shortcuts — just supplements that work.
        </p>
      </div>
    </section>
  );
}