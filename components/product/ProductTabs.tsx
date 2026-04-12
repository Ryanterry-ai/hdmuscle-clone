"use client";

import { useState } from "react";

interface ProductTabsProps {
  description: string;
  benefits?: string[];
  ingredients?: string;
}

export default function ProductTabs({ description, benefits, ingredients }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "benefits", label: "Benefits" },
    { id: "ingredients", label: "Ingredients" },
  ];

  return (
    <div className="border-t border-b border-[#e5e5e5] py-8">
      {/* Tab Buttons */}
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-oswald text-lg font-medium uppercase tracking-wider pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#1d1d1d] text-[#1d1d1d]"
                : "border-transparent text-[#737373] hover:text-[#1d1d1d]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="prose prose-lg max-w-none">
        {activeTab === "description" && (
          <div className="text-[#1d1d1d] leading-relaxed">
            <p>{description}</p>
          </div>
        )}

        {activeTab === "benefits" && benefits && (
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-[#ffcc00]">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "ingredients" && (
          <div className="bg-[#fafafa] p-4 rounded">
            <pre className="whitespace-pre-wrap font-mono text-sm">{ingredients}</pre>
          </div>
        )}
      </div>
    </div>
  );
}