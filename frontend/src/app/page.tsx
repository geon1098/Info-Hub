"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import InfoGrid from "@/components/InfoGrid";
import { CATEGORIES } from "@/lib/categories";
import { CategoryKey, Info } from "@/types";
import { useAuth } from "@/lib/authStore";
import { api } from "@/lib/api";

interface PageData {
  content: Info[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export default function HomePage() {
  const [category, setCategory] = useState<CategoryKey | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<Info[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    const fetchInfos = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = { page: 0, size: 24 };
        if (category !== "ALL") params.category = category;
        if (keyword.trim()) params.keyword = keyword.trim();
        const res = await api.get<{ data: PageData }>("/infos", {
          params,
          signal: controller.signal,
        });
        setItems(res.data.data.content);
      } catch (err) {
        if (axios.isCancel(err)) return;
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "정보를 불러오지 못했습니다.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchInfos, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [category, keyword]);

  const tabs: { key: CategoryKey | "ALL"; label: string }[] = [
    { key: "ALL", label: "전체" },
    ...CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">
          정보를 탐색하고, 인사이트를 얻으세요.
        </h1>
        <p className="mt-2 text-sm text-brand-50 sm:text-base">
          개발 · AI · 트렌드 — 큐레이션된 정보 카드를 한눈에.
        </p>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            정보 둘러보기
          </h2>
          <div className="flex items-center gap-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="제목 · 태그 검색"
              className="w-56 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            />
            {user && (
              <Link
                href="/info/new"
                className="rounded-md bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                + 정보 작성
              </Link>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={
                category === tab.key
                  ? "rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : (
          <InfoGrid items={items} />
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              자유롭게 이야기 나누고 싶다면?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              커뮤니티 게시판에서 다른 사용자들과 의견을 주고받아 보세요.
            </p>
          </div>
          <Link
            href="/posts"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            커뮤니티 가기 →
          </Link>
        </div>
      </section>
    </div>
  );
}
