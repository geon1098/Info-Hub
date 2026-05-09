"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useMemo, useState, use } from "react";
import CommentList from "@/components/CommentList";
import { MOCK_COMMENTS, MOCK_POSTS } from "@/lib/mockData";
import { categoryLabel } from "@/lib/categories";
import { useAuth } from "@/lib/authStore";
import { Comment } from "@/types";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const post = useMemo(
    () => MOCK_POSTS.find((p) => String(p.id) === id),
    [id]
  );

  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS.filter((c) => String(c.postId) === id)
  );

  if (!post) return notFound();

  const isOwner = user?.id === post.authorId;
  const isAdmin = user?.role === "ADMIN";

  const handleDeletePost = () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    // TODO: DELETE /api/posts/{id} 연결
    alert("삭제되었습니다 (mock).");
    router.push("/posts");
  };

  const handleCreateComment = (content: string) => {
    if (!user) return;
    const newComment: Comment = {
      id: Date.now(),
      postId: Number(id),
      author: user.nickname,
      authorId: user.id,
      content,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    // TODO: POST /api/posts/{id}/comments 연결
  };

  const handleUpdateComment = (commentId: number, content: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, content } : c))
    );
    // TODO: PUT /api/comments/{id} 연결
  };

  const handleDeleteComment = (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    // TODO: DELETE /api/comments/{id} 연결
  };

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-3 flex items-center gap-2 text-xs">
        <Link
          href={`/posts?category=${post.category}`}
          className="rounded bg-brand-50 px-2 py-0.5 font-medium text-brand-700"
        >
          {categoryLabel(post.category)}
        </Link>
        <span className="text-gray-400">{post.author}</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-400">
          {new Date(post.createdAt).toLocaleString("ko-KR")}
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-400">조회 {post.viewCount}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>

      <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-gray-800">
        {post.content}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
        <Link href="/posts" className="text-gray-500 hover:underline">
          ← 목록으로
        </Link>

        {(isOwner || isAdmin) && (
          <div className="flex gap-2">
            {isOwner && (
              <Link
                href={`/posts/${post.id}/edit`}
                className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
              >
                수정
              </Link>
            )}
            <button
              onClick={handleDeletePost}
              className="rounded border border-rose-300 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <CommentList
        comments={comments}
        onCreate={handleCreateComment}
        onUpdate={handleUpdateComment}
        onDelete={handleDeleteComment}
      />
    </article>
  );
}
