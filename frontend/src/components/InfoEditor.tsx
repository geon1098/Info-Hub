"use client";

import { useState, KeyboardEvent } from "react";
import { CategoryKey, InfoDraft } from "@/types";
import { CATEGORIES } from "@/lib/categories";
import ImageUploader from "./ImageUploader";
import TagList from "./TagList";

interface Props {
  mode: "create" | "edit";
  initial?: Partial<InfoDraft>;
  onSubmit: (draft: InfoDraft) => void;
  onCancel: () => void;
}

const EMPTY: InfoDraft = {
  title: "",
  imageUrl: "",
  tags: [],
  category: "DEV",
  body: "",
};

export default function InfoEditor({ mode, initial, onSubmit, onCancel }: Props) {
  const [draft, setDraft] = useState<InfoDraft>({ ...EMPTY, ...initial });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag) return;
    if (draft.tags.includes(tag)) return;
    if (draft.tags.length >= 5) return;
    setDraft({ ...draft, tags: [...draft.tags, tag] });
  };

  const removeTag = (tag: string) => {
    setDraft({ ...draft, tags: draft.tags.filter((t) => t !== tag) });
  };

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    } else if (e.key === "Backspace" && tagInput === "" && draft.tags.length > 0) {
      removeTag(draft.tags[draft.tags.length - 1]);
    }
  };

  const submit = () => {
    if (!draft.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!draft.body.trim()) {
      setError("본문을 입력해 주세요.");
      return;
    }
    setError(null);
    onSubmit(draft);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {mode === "create" ? "정보 작성" : "정보 수정"}
        </h1>
        <span className="text-xs text-gray-400">
          {mode === "create" ? "새 정보를 등록합니다" : "기존 정보를 수정합니다"}
        </span>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            제목
          </label>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="정보의 제목을 입력하세요"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            카테고리
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() =>
                  setDraft({ ...draft, category: c.key as CategoryKey })
                }
                className={
                  draft.category === c.key
                    ? "rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white"
                    : "rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <ImageUploader
          value={draft.imageUrl}
          onChange={(url) => setDraft({ ...draft, imageUrl: url })}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            태그 <span className="text-xs text-gray-400">(최대 5개, Enter로 추가)</span>
          </label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKey}
            placeholder="예: React, AI, 트렌드"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          {draft.tags.length > 0 && (
            <div className="mt-2">
              <TagList tags={draft.tags} size="md" onRemove={removeTag} />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            본문
          </label>
          <textarea
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder={"문단은 빈 줄로 구분합니다.\n\n본문 안에 이미지를 넣으려면 다음과 같이 작성하세요:\n![이미지 설명](https://example.com/image.png)"}
            rows={14}
            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-sm leading-7 focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            <code className="rounded bg-gray-100 px-1 py-0.5">![alt](url)</code> 문법으로 본문 안에 이미지를 삽입할 수 있습니다.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {mode === "create" ? "등록" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
