"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import CategoryTabs from "@/components/CategoryTabs";
import PostCard from "@/components/PostCard";
import { CategoryKey, Post } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authStore";

interface PageData {
  content: Post[];
  totalElements: number;
}

export default function PostListPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>}>
      <PostListContent />
    </Suspense>
  );
}

function PostListContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("category") as CategoryKey | null) ?? "ALL";
  const { user } = useAuth();

  const [category, setCategory] = useState<CategoryKey | "ALL">(initial);
  const [keyword, setKeyword] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = (params.get("category") as CategoryKey | null) ?? "ALL";
    setCategory(next);
  }, [params]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const query: Record<string, string | number> = { page: 0, size: 50 };
        if (category !== "ALL") query.category = category;
        const res = await api.get<{ data: PageData }>("/posts", {
          params: query,
          signal: controller.signal,
        });
        setPosts(res.data.data.content);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    return () => controller.abort();
  }, [category]);

  const filtered = keyword.trim()
    ? posts.filter((p) => {
        const k = keyword.trim().toLowerCase();
        return (
          p.title.toLowerCase().includes(k) ||
          p.content.toLowerCase().includes(k)
        );
      })
    : posts;

  const onChangeCategory = (key: CategoryKey | "ALL") => {
    setCategory(key);
    const url = key === "ALL" ? "/posts" : `/posts?category=${key}`;
    router.replace(url);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">커뮤니티 게시판</h1>
        <div className="flex items-center gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색"
            className="w-44 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          />
          {user && (
            <Link
              href="/posts/new"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              + 글쓰기
            </Link>
          )}
        </div>
      </div>

      <CategoryTabs selected={category} onChange={onChangeCategory} />

      {error && (
        <p className="mt-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : filtered.length === 0 ? (
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
