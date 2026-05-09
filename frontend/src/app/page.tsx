import Link from "next/link";
import PostCard from "@/components/PostCard";
import { MOCK_POSTS } from "@/lib/mockData";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  const popular = [...MOCK_POSTS]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 3);
  const recent = [...MOCK_POSTS]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">
          최신 트렌드와 인사이트, InfoHub에서.
        </h1>
        <p className="mt-2 text-sm text-brand-50 sm:text-base">
          개발 · AI · 트렌드 · 자유 — 관심사로 모이고, 글로 소통하세요.
        </p>
        <div className="mt-5 flex gap-2">
          <Link
            href="/posts"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            게시글 둘러보기
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            회원가입
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-gray-900">카테고리</h2>
          <Link href="/posts" className="text-xs text-gray-500 hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/posts?category=${c.key}`}
              className="rounded-lg border border-gray-200 bg-white p-4 text-center hover:border-brand-500"
            >
              <div className="text-sm font-semibold text-gray-900">
                {c.label}
              </div>
              <div className="mt-1 text-xs text-gray-500">바로가기</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">🔥 인기글</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {popular.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-gray-900">📰 최신글</h2>
          <Link href="/posts" className="text-xs text-gray-500 hover:underline">
            더보기 →
          </Link>
        </div>
        <div className="grid gap-3">
          {recent.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
