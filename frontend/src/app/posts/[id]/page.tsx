"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import CommentList from "@/components/CommentList";
import { categoryLabel } from "@/lib/categories";
import { useAuth } from "@/lib/authStore";
import { api } from "@/lib/api";
import { Comment, Post } from "@/types";

export default function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get<{ data: Post }>(`/posts/${id}`),
          api.get<{ data: Comment[] }>(`/posts/${id}/comments`),
        ]);
        setPost(postRes.data.data);
        setComments(commentsRes.data.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFoundFlag(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (notFoundFlag) return notFound();
  if (loading || !post) return <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>;

  const isOwner = user?.id === post.authorId;
  const isAdmin = user?.role === "ADMIN";

  const handleDeletePost = async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/posts/${id}`);
      alert("삭제되었습니다.");
      router.push("/posts");
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "삭제에 실패했습니다.";
      alert(message);
    }
  };

  const handleCreateComment = async (content: string) => {
    try {
      const res = await api.post<{ data: Comment }>(`/posts/${id}/comments`, { content });
      setComments((prev) => [...prev, res.data.data]);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "댓글 작성에 실패했습니다.";
      alert(message);
    }
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    try {
      const res = await api.put<{ data: Comment }>(`/comments/${commentId}`, { content });
      setComments((prev) => prev.map((c) => (c.id === commentId ? res.data.data : c)));
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "댓글 수정에 실패했습니다.";
      alert(message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "댓글 삭제에 실패했습니다.";
      alert(message);
    }
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
