"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { MOCK_POSTS } from "@/lib/mockData";
import { useAuth } from "@/lib/authStore";

export default function MyPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const myPosts = MOCK_POSTS.filter((p) => p.authorId === user.id);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">닉네임</dt>
            <dd className="text-gray-900">{user.nickname}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">이메일</dt>
            <dd className="text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">권한</dt>
            <dd className="text-gray-900">{user.role}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">가입일</dt>
            <dd className="text-gray-900">
              {new Date(user.createdAt).toLocaleDateString("ko-KR")}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex gap-2 text-xs">
          <button
            onClick={() => alert("프로필 수정 (mock)")}
            className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
          >
            프로필 수정
          </button>
          <button
            onClick={() => alert("비밀번호 변경 (mock)")}
            className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
          >
            비밀번호 변경
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            내가 쓴 글 ({myPosts.length})
          </h2>
          <Link
            href="/posts/new"
            className="text-xs text-brand-600 hover:underline"
          >
            새 글 쓰기 →
          </Link>
        </div>

        {myPosts.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
            아직 작성한 글이 없습니다.
          </p>
        ) : (
          <div className="grid gap-3">
            {myPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
