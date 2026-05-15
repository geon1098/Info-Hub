"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import InfoGrid from "@/components/InfoGrid";
import { MOCK_INFOS } from "@/lib/infoData";
import { CATEGORIES } from "@/lib/categories";
import { CategoryKey } from "@/types";

export default function HomePage() {
  const [category, setCategory] = useState<CategoryKey | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    let list = MOCK_INFOS;
    if (category !== "ALL") list = list.filter((i) => i.category === category);
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(k) ||
          i.tags.some((t) => t.toLowerCase().includes(k))
      );
    }
    return list;
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
            <Link
              href="/info/new"
              className="rounded-md bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              + 정보 작성
            </Link>
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

        <InfoGrid items={filtered} />
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
