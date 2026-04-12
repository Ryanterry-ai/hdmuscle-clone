"use client";

import { products } from "@/lib/data";
import ProductCarousel from "./ProductCarousel";

export default function BestSellers() {
  const bestSellersProducts = products.slice(0, 9);
  
  return (
    <section className="py-4 md:py-6 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-[1100px] mx-auto px-4">
        <ProductCarousel
          products={bestSellersProducts}
          title="SHOP OUR BEST SELLERS"
          showViewAll={true}
          viewAllLink="https://hdmuscle.com/collections/best-selling-collection"
        />
      </div>
    </section>
  );
}