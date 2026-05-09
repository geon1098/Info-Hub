import { Category, CategoryKey } from "@/types";

export const CATEGORIES: Category[] = [
  { key: "TREND", label: "트렌드" },
  { key: "DEV", label: "개발" },
  { key: "AI", label: "AI" },
  { key: "FREE", label: "자유게시판" },
];

export const categoryLabel = (key: CategoryKey): string =>
  CATEGORIES.find((c) => c.key === key)?.label ?? key;
