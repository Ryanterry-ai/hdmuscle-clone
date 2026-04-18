'use client';

import { CMSSections, CMSToggle } from '@/components/CMSSections';
import { useState } from 'react';

function StaticHomepage() {
  return (
    <main className="min-h-screen">
      <section className="relative bg-cover bg-center min-h-[600px] flex items-center" style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build Your Dream Body
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Premium supplements for serious athletes. Fuel your ambition with HD Muscle.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/products" className="px-8 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
              Shop Now
            </a>
            <a href="/about" className="px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-gray-900 transition-colors">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Product {i}</h3>
                  <p className="text-red-600 font-bold">₹2,499</p>
                  <button className="w-full mt-3 bg-gray-900 text-white py-2 rounded text-sm">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8">
            Subscribe to our newsletter for exclusive offers and updates
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-gray-900"
            />
            <button className="px-6 py-3 bg-red-600 font-semibold rounded-md hover:bg-red-700 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <>
      <CMSSections fallback={<StaticHomepage />} />
      <CMSToggle />
    </>
  );
}
