"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs";
import PostCard from "@/components/PostCard";
import { MOCK_POSTS } from "@/lib/mockData";
import { CategoryKey } from "@/types";

export default function PostListPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("category") as CategoryKey | null) ?? "ALL";

  const [category, setCategory] = useState<CategoryKey | "ALL">(initial);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const next = (params.get("category") as CategoryKey | null) ?? "ALL";
    setCategory(next);
  }, [params]);

  const filtered = useMemo(() => {
    let list = [...MOCK_POSTS];
    if (category !== "ALL") list = list.filter((p) => p.category === category);
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(k) ||
          p.content.toLowerCase().includes(k)
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [category, keyword]);

  const onChangeCategory = (key: CategoryKey | "ALL") => {
    setCategory(key);
    const url = key === "ALL" ? "/posts" : `/posts?category=${key}`;
    router.replace(url);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">게시글</h1>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색"
          className="w-44 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <CategoryTabs selected={category} onChange={onChangeCategory} />

      <div className="mt-4 grid gap-3">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            조건에 해당하는 게시글이 없습니다.
          </p>
        ) : (
          filtered.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}
