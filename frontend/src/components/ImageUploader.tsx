"use client";

import { useRef, useState, ChangeEvent, DragEvent } from "react";
import axios from "axios";
import { api } from "@/lib/api";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "대표 이미지",
  hint = "PNG · JPG · WEBP · SVG (최대 5MB)",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<{ data: { url: string } }>(
        "/uploads/images",
        formData
      );
      onChange(res.data.data.url);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "이미지 업로드에 실패했습니다.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-white"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
        style={{ aspectRatio: "16 / 9" }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="대표 이미지 미리보기"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              {uploading ? "업로드 중..." : "이미지 변경"}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-center text-gray-500">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-gray-400"
            >
              <path d="M12 16V4M12 4l-4 4m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-medium">
              {uploading ? "업로드 중..." : "이미지를 끌어다 놓거나 클릭하세요"}
            </p>
            <p className="text-xs text-gray-400">{hint}</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 rounded bg-rose-50 px-2 py-1 text-xs text-rose-600">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
