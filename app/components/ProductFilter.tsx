'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  SlidersHorizontal,
  ChevronDown,
  Check,
} from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface ProductFilterProps {
  categories: FilterOption[];
  brands: FilterOption[];
  goals: FilterOption[];
  priceRange: { min: number; max: number };
}

export default function ProductFilter({
  categories,
  brands,
  goals,
  priceRange,
}: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.getAll('category'));
  const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.getAll('brand'));
  const [selectedGoals, setSelectedGoals] = useState<string[]>(searchParams.getAll('goal'));
  const [price, setPrice] = useState(priceRange);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [expandedSection, setExpandedSection] = useState<string>('categories');

  const toggleSelection = (
    value: string,
    current: string[],
    setter: (val: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    selectedCategories.forEach(c => params.append('category', c));
    selectedBrands.forEach(b => params.append('brand', b));
    selectedGoals.forEach(g => params.append('goal', g));
    if (inStockOnly) params.set('inStock', 'true');
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedGoals([]);
    setPrice(priceRange);
    setInStockOnly(false);
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <button
          onClick={() =>
            setExpandedSection(
              expandedSection === 'categories' ? '' : 'categories'
            )
          }
          className="flex items-center justify-between w-full font-semibold text-gray-900 mb-3"
        >
          Categories
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSection === 'categories' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSection === 'categories' && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedCategories.includes(cat.value)
                      ? 'bg-primary border-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedCategories.includes(cat.value) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.value)}
                  onChange={() =>
                    toggleSelection(cat.value, selectedCategories, setSelectedCategories)
                  }
                  className="hidden"
                />
                <span className="text-sm">{cat.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() =>
            setExpandedSection(expandedSection === 'brands' ? '' : 'brands')
          }
          className="flex items-center justify-between w-full font-semibold text-gray-900 mb-3"
        >
          Brands
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSection === 'brands' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSection === 'brands' && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <label
                key={brand.value}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedBrands.includes(brand.value)
                      ? 'bg-primary border-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedBrands.includes(brand.value) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.value)}
                  onChange={() =>
                    toggleSelection(brand.value, selectedBrands, setSelectedBrands)
                  }
                  className="hidden"
                />
                <span className="text-sm">{brand.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() =>
            setExpandedSection(expandedSection === 'goals' ? '' : 'goals')
          }
          className="flex items-center justify-between w-full font-semibold text-gray-900 mb-3"
        >
          Goals
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSection === 'goals' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSection === 'goals' && (
          <div className="space-y-2">
            {goals.map((goal) => (
              <label
                key={goal.value}
                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedGoals.includes(goal.value)
                      ? 'bg-primary border-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedGoals.includes(goal.value) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedGoals.includes(goal.value)}
                  onChange={() =>
                    toggleSelection(goal.value, selectedGoals, setSelectedGoals)
                  }
                  className="hidden"
                />
                <span className="text-sm">{goal.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={price.min}
            onChange={(e) =>
              setPrice({ ...price, min: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
            placeholder="Min"
          />
          <span className="text-text-muted">-</span>
          <input
            type="number"
            value={price.max}
            onChange={(e) =>
              setPrice({ ...price, max: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
            placeholder="Max"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            inStockOnly ? 'bg-primary border-primary' : 'border-gray-300'
          }`}
        >
          {inStockOnly && <Check className="w-3 h-3 text-white" />}
        </div>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="hidden"
        />
        <span className="text-sm">In stock only</span>
      </label>

      <div className="flex gap-2 pt-4 border-t border-border-light">
        <button onClick={clearFilters} className="btn-ghost flex-1 text-sm">
          Clear
        </button>
        <button onClick={applyFilters} className="btn-filled flex-1 text-sm">
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-outlined text-sm py-2 px-4 inline-flex items-center gap-2 lg:hidden"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </button>

      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-xl border border-border-light p-5 sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
          {filterContent}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl animate-slide-down">
            <div className="flex items-center justify-between p-4 border-b border-border-light">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
