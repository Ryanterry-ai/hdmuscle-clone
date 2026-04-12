"use client";

import Image from "next/image";

const features = [
  {
    image: "/images/downloaded/feature-returns.svg",
    title: "EASY RETURNS",
    text: "If something isn't right, we'll make it right. Unopened products can be returned within 30 days of delivery. For support, reach us anytime at info@hdmuscle.com",
  },
  {
    image: "/images/downloaded/feature-shipping.svg",
    title: "FAST SHIPPING",
    text: "We ship from warehouses in both Canada and the USA to ensure faster delivery and lower duties for our customers. Orders are processed quickly — most ship within 1–2 business days.",
  },
  {
    image: "/images/downloaded/feature-guarantee.svg",
    title: "OUR GUARANTEE",
    text: "We stand behind every formula we make. If you don't love your HD Muscle experience, contact us — our team is here to help.",
  },
  {
    image: "/images/downloaded/feature-checkout.svg",
    title: "SECURE CHECKOUT",
    text: "Encrypted, secure payment processing — your information stays protected.",
  },
];

export default function TrustFeatures() {
  return (
    <section className="bg-white py-10 md:py-14 border-t border-[#e5e5e5]">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="font-oswald text-xl md:text-2xl font-bold text-[#1d1d1d] text-center mb-8 uppercase tracking-wider">
          YOU&apos;RE COVERED
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-4">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <Image 
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-oswald text-sm font-bold text-[#1d1d1d] uppercase mb-2 tracking-wider">
                {feature.title}
              </h3>
              <p className="text-[#737373] text-xs leading-relaxed">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}