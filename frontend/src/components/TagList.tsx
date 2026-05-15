"use client";

interface Props {
  tags: string[];
  size?: "sm" | "md";
  onRemove?: (tag: string) => void;
  className?: string;
}

export default function TagList({ tags, size = "sm", onRemove, className }: Props) {
  if (tags.length === 0) return null;

  const base =
    size === "md"
      ? "px-3 py-1 text-xs"
      : "px-2.5 py-0.5 text-[11px]";

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 rounded-full bg-brand-50 font-medium text-brand-700 ${base}`}
        >
          #{tag}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(tag)}
              aria-label={`${tag} 삭제`}
              className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-brand-500 hover:bg-brand-100 hover:text-brand-700"
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
