'use client';

import { useRouter } from 'next/navigation';

interface SortSelectProps {
  defaultValue: string;
}

export default function SortSelect({ defaultValue }: SortSelectProps) {
  const router = useRouter();
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

  return (
    <select
      value={defaultValue}
      className="text-sm border border-border-light rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-primary"
      onChange={(e) => {
        params.set('sort', e.target.value);
        params.set('page', '1');
        router.push(`/shop?${params.toString()}`);
      }}
    >
      <option value="newest">Newest</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name">Name: A to Z</option>
    </select>
  );
}
