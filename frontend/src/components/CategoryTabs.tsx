"use client";

import { CATEGORIES } from "@/lib/categories";
import { CategoryKey } from "@/types";

interface Props {
  selected: CategoryKey | "ALL";
  onChange: (key: CategoryKey | "ALL") => void;
}

export default function CategoryTabs({ selected, onChange }: Props) {
  const items: { key: CategoryKey | "ALL"; label: string }[] = [
    { key: "ALL", label: "전체" },
    ...CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={
            selected === item.key
              ? "rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white"
              : "rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
