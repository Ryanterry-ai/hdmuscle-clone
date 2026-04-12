"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What makes HD Muscle supplements different?",
    answer: "Our formulas use clinically backed ingredients, transparent labels, and effective dosages. No proprietary blends, no fillers — just supplements that work.",
  },
  {
    question: "Are your products safe and third-party tested?",
    answer: "Yes. All HD Muscle supplements are produced in GMP-certified facilities and tested for purity, potency, and heavy metals.",
  },
  {
    question: "Are your products vegan or gluten-free?",
    answer: "It depends on the product. Many of our health & wellness items are vegan-friendly, while some performance formulas contain dairy or animal-based ingredients. Check each label for specifics.",
  },
  {
    question: "Do you ship to the USA?",
    answer: "Yes. We ship from both Canada and the USA to reduce shipping times and duties for customers in each region.",
  },
  {
    question: "How long does shipping take?",
    answer: "Most orders ship within 1–2 business days. Delivery times vary based on location but typically range from 2–7 business days.",
  },
  {
    question: "How do I become part of the HD Collective?",
    answer: 'You can apply by emailing Hannah@hdmuscle.com with your socials and a short intro.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-10 md:py-14 border-t border-[#e5e5e5]">
      <div className="max-w-[800px] mx-auto px-4">
        <h2 className="font-oswald text-xl md:text-2xl font-bold text-[#1d1d1d] text-center mb-8 uppercase tracking-wider">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-[#e5e5e5] rounded"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-[#1d1d1d] text-sm pr-4">{faq.question}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width={20} 
                  height={20} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2} 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-4 pb-4">
                  <p className="text-[#737373] text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <a 
            href="/pages/faq"
            className="inline-block text-sm text-[#1d1d1d] underline hover:text-[#ffcc00] transition-colors"
          >
            View all FAQ
          </a>
        </div>
      </div>
    </section>
  );
}