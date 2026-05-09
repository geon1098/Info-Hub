"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_COMMENTS, MOCK_POSTS, MOCK_USER } from "@/lib/mockData";
import { useAuth } from "@/lib/authStore";
import { categoryLabel } from "@/lib/categories";
import { Comment, Post, User } from "@/types";

type Tab = "posts" | "comments" | "users";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [users, setUsers] = useState<User[]>([
    MOCK_USER,
    {
      id: 2,
      email: "trend@infohub.dev",
      nickname: "트렌드러버",
      role: "USER",
      createdAt: "2026-02-01T09:00:00",
    },
    {
      id: 3,
      email: "back@infohub.dev",
      nickname: "백엔드초보",
      role: "USER",
      createdAt: "2026-02-15T09:00:00",
    },
    {
      id: 99,
      email: "admin@infohub.dev",
      nickname: "관리자",
      role: "ADMIN",
      createdAt: "2026-01-01T09:00:00",
    },
  ]);

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      alert("접근 권한이 없습니다.");
      router.replace("/");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  const deletePost = (id: number) => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteComment = (id: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleRole = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: u.role === "ADMIN" ? "USER" : "ADMIN" } : u
      )
    );
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">관리자 페이지</h1>

      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {(
          [
            { key: "posts", label: `게시글 (${posts.length})` },
            { key: "comments", label: `댓글 (${comments.length})` },
            { key: "users", label: `사용자 (${users.length})` },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "border-b-2 border-brand-600 px-3 py-2 text-sm font-semibold text-brand-700"
                : "px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <table className="w-full overflow-hidden rounded border border-gray-200 bg-white text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">카테고리</th>
              <th className="px-3 py-2 text-left">제목</th>
              <th className="px-3 py-2 text-left">작성자</th>
              <th className="px-3 py-2 text-right">조회</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-3 py-2 text-gray-500">{p.id}</td>
                <td className="px-3 py-2">{categoryLabel(p.category)}</td>
                <td className="px-3 py-2 text-gray-900">{p.title}</td>
                <td className="px-3 py-2 text-gray-600">{p.author}</td>
                <td className="px-3 py-2 text-right text-gray-600">
                  {p.viewCount}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => deletePost(p.id)}
                    className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "comments" && (
        <table className="w-full overflow-hidden rounded border border-gray-200 bg-white text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">작성자</th>
              <th className="px-3 py-2 text-left">내용</th>
              <th className="px-3 py-2 text-left">게시글</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-3 py-2 text-gray-500">{c.id}</td>
                <td className="px-3 py-2">{c.author}</td>
                <td className="px-3 py-2 text-gray-800">{c.content}</td>
                <td className="px-3 py-2 text-gray-500">#{c.postId}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "users" && (
        <table className="w-full overflow-hidden rounded border border-gray-200 bg-white text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">이메일</th>
              <th className="px-3 py-2 text-left">닉네임</th>
              <th className="px-3 py-2 text-left">권한</th>
              <th className="px-3 py-2 text-left">가입일</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-3 py-2 text-gray-500">{u.id}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.nickname}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      u.role === "ADMIN"
                        ? "rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
                        : "rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => toggleRole(u.id)}
                    className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    권한 토글
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
