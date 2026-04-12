"use client";

import Image from "next/image";

const testimonials = [
  {
    image: "/images/downloaded/testimonial-whitney.png",
    name: "Whitney L.",
    text: "THIS ONE WORKS! Almost works too good! I have never had a sports supplement work so well on my ability to not only fall asleep but literally sleep like a complete rock. So many struggle with proper sleep, I will be recommending Sleep HD to all my clients. Thank you!",
  },
  {
    image: "/images/downloaded/testimonial-greg.jpg",
    name: "Greg D.",
    text: "PreHD Ultra is my new gym bag essential, amazing pump, clean/non jittery energy, awesome taste, and properly dosed ingredients!",
  },
  {
    image: "/images/downloaded/testimonial-christina.png",
    name: "Christina D.",
    text: "All the products are top quality, everything tastes AMAZING! Your health is an investment, and if you invest in quality products your body will thank you! Customer service has been 10/10",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-10 md:py-14 border-t border-b border-[#e5e5e5]">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="font-oswald text-xl md:text-2xl font-bold text-[#1d1d1d] text-center mb-8 uppercase tracking-wider">
          REAL PEOPLE, REAL REVIEWS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="text-center p-4">
              <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                <Image 
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Stars */}
              <div className="flex justify-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    xmlns="http://www.w3.org/2000/svg" 
                    width={16} 
                    height={16} 
                    viewBox="0 0 24 24" 
                    fill="#f6a529" 
                    stroke="#f6a529" 
                    strokeWidth={2}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              
              <h3 className="font-bold text-[#1d1d1d] text-sm mb-2">{testimonial.name}</h3>
              <p className="text-[#737373] text-xs leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}