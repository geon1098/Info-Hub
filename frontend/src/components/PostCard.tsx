import Link from "next/link";
import { Post } from "@/types";
import { categoryLabel } from "@/lib/categories";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-sm"
    >
      <div className="mb-1 flex items-center gap-2 text-xs">
        <span className="rounded bg-brand-50 px-2 py-0.5 font-medium text-brand-700">
          {categoryLabel(post.category)}
        </span>
        <span className="text-gray-400">{post.author}</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-400">
          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
        </span>
      </div>
      <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
        {post.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.content}</p>
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <span>조회 {post.viewCount.toLocaleString()}</span>
        <span>댓글 {post.commentCount}</span>
      </div>
    </Link>
  );
}
