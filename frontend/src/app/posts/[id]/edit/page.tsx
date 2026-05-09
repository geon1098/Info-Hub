"use client";

import { notFound, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { CATEGORIES } from "@/lib/categories";
import { CategoryKey } from "@/types";
import { MOCK_POSTS } from "@/lib/mockData";
import { useAuth } from "@/lib/authStore";

export default function PostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const post = MOCK_POSTS.find((p) => String(p.id) === id);

  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState<CategoryKey>(
    post?.category ?? "DEV"
  );

  useEffect(() => {
    if (!post) return;
    if (!user || (user.id !== post.authorId && user.role !== "ADMIN")) {
      alert("수정 권한이 없습니다.");
      router.replace(`/posts/${id}`);
    }
  }, [user, post, id, router]);

  if (!post) return notFound();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    // TODO: PUT /api/posts/{id} 연결
    alert("수정되었습니다 (mock).");
    router.push(`/posts/${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-gray-900">게시글 수정</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryKey)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
