'use client';

import { CATEGORIES, Category } from '@/types';

interface CategoryFilterProps {
  selected: Category | null;
  onChange: (category: Category | null) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
          selected === null
            ? 'bg-indigo-500 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        전체
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
            selected === cat
              ? 'bg-indigo-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
