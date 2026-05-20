"use client";

import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { CATEGORIES } from "@/lib/categories";
import { CategoryKey, Post } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authStore";

export default function PostEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<CategoryKey>("DEV");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get<{ data: Post }>(`/posts/${id}`);
        const p = res.data.data;
        setPost(p);
        setTitle(p.title);
        setContent(p.content);
        setCategory(p.category);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFoundFlag(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!post) return;
    if (!user || (user.id !== post.authorId && user.role !== "ADMIN")) {
      alert("수정 권한이 없습니다.");
      router.replace(`/posts/${id}`);
    }
  }, [user, post, id, router]);

  if (notFoundFlag) return notFound();
  if (loading || !post) return <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    try {
      await api.put(`/posts/${id}`, { title, content, category });
      alert("수정되었습니다.");
      router.push(`/posts/${id}`);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "수정에 실패했습니다.";
      alert(message);
    }
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
