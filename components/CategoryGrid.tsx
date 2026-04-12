"use client";

import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "Health + Wellness",
    image: "/images/downloaded/category-health.jpg",
    href: "https://hdmuscle.com/collections/health-wellness"
  },
  {
    title: "Pre-workout",
    image: "/images/downloaded/category-preworkout.png",
    href: "https://hdmuscle.com/collections/pre-workouts"
  },
  {
    title: "Intra-workout",
    image: "/images/downloaded/category-intraworkout.jpg",
    href: "https://hdmuscle.com/collections/intra-workouts"
  },
  {
    title: "Post-workout",
    image: "/images/downloaded/category-postworkout.png",
    href: "https://hdmuscle.com/collections/post-workout"
  },
];

export default function CategoryGrid() {
  return (
    <section className="bg-white py-8 md:py-12">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link 
              key={index}
              href={category.href}
              className="group block"
            >
              {/* Image container */}
              <div className="relative aspect-[3/4] overflow-hidden rounded mb-3">
                <Image 
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              </div>
              {/* Title below the image */}
              <div className="text-center">
                <h3 className="font-oswald text-sm md:text-base font-bold text-[#1d1d1d] uppercase tracking-wider">
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}