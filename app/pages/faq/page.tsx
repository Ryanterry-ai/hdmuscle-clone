"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What makes HD Muscle supplements different?",
    answer: "Our formulas use clinically backed ingredients, transparent labels, and effective dosages. No proprietary blends, no fillers — just supplements that work."
  },
  {
    question: "Are your products safe and third-party tested?",
    answer: "Yes. All HD Muscle supplements are produced in GMP-certified facilities and tested for purity, potency, and heavy metals."
  },
  {
    question: "Are your products vegan or gluten-free?",
    answer: "It depends on the product. Many of our health & wellness items are vegan-friendly, while some performance formulas contain dairy or animal-based ingredients. Check each label for specifics."
  },
  {
    question: "Do you ship to the USA?",
    answer: "Yes. We ship from both Canada and the USA to reduce shipping times and duties for customers in each region."
  },
  {
    question: "How long does shipping take?",
    answer: "Most orders ship within 1–2 business days. Delivery times vary based on location but typically range from 2–7 business days."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for unopened products. Contact us at info@hdmuscle.com for return authorization."
  },
  {
    question: "How do I become part of the HD Collective?",
    answer: "You can apply by emailing Hannah@hdmuscle.com with your socials and a short intro."
  },
  {
    question: "Do you offer wholesale pricing?",
    answer: "Yes, we offer wholesale pricing for gyms, retailers, and online sellers. Contact us at wholesale@hdmuscle.com for more information."
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen pt-[120px] pb-16">
      <div className="max-w-[800px] mx-auto px-4">
        <h1 className="font-oswald text-4xl font-bold text-[#1d1d1d] text-center mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-[#737373] text-center mb-12">
          Find answers to commonly asked questions about HD Muscle products and services.
        </p>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-[#e5e5e5] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#fafafa]"
              >
                <span className="font-medium text-[#1d1d1d] pr-4">{faq.question}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width={20} 
                  height={20} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2} 
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

        <div className="mt-12 text-center">
          <p className="text-[#737373] mb-4">Still have questions?</p>
          <a 
            href="/pages/contact" 
            className="inline-block bg-[#1d1d1d] text-white px-8 py-3 font-oswald font-bold uppercase hover:bg-[#ffcc00] hover:text-[#1d1d1d] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </main>
  );
}