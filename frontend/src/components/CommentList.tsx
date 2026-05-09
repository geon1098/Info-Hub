"use client";

import { useState } from "react";
import { Comment } from "@/types";
import { useAuth } from "@/lib/authStore";

interface Props {
  comments: Comment[];
  onCreate: (content: string) => void;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

export default function CommentList({
  comments,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onCreate(text.trim());
    setText("");
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.content);
  };

  const submitEdit = (id: number) => {
    if (!editText.trim()) return;
    onUpdate(id, editText.trim());
    setEditingId(null);
  };

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        댓글 {comments.length}
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            등록
          </button>
        </form>
      ) : (
        <p className="mb-6 rounded-md border border-dashed border-gray-300 p-3 text-center text-sm text-gray-500">
          로그인 후 댓글을 작성할 수 있습니다.
        </p>
      )}

      <ul className="space-y-3">
        {comments.length === 0 && (
          <li className="py-4 text-center text-sm text-gray-400">
            아직 댓글이 없습니다.
          </li>
        )}

        {comments.map((c) => {
          const mine = user?.id === c.authorId;
          const isAdmin = user?.role === "ADMIN";
          const editing = editingId === c.id;

          return (
            <li
              key={c.id}
              className="rounded-md border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium text-gray-700">{c.author}</span>
                <span>{new Date(c.createdAt).toLocaleString("ko-KR")}</span>
              </div>

              {editing ? (
                <div className="mt-2 flex gap-2">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => submitEdit(c.id)}
                    className="rounded bg-brand-600 px-3 py-1 text-xs text-white"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded border border-gray-300 px-3 py-1 text-xs"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                  {c.content}
                </p>
              )}

              {(mine || isAdmin) && !editing && (
                <div className="mt-2 flex justify-end gap-2 text-xs">
                  {mine && (
                    <button
                      onClick={() => startEdit(c)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      수정
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    삭제
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
