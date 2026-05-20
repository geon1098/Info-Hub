"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import InfoDetail from "@/components/InfoDetail";
import DeleteModal from "@/components/DeleteModal";
import { useAuth } from "@/lib/authStore";
import { api } from "@/lib/api";
import { Info } from "@/types";

export default function InfoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await api.get<{ data: Info }>(`/infos/${id}`);
        setInfo(res.data.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFoundFlag(true);
        } else {
          setError("정보를 불러오지 못했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [id]);

  if (notFoundFlag) return notFound();
  if (loading) return <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>;
  if (error || !info) return <p className="py-12 text-center text-sm text-rose-600">{error}</p>;

  const onDelete = async () => {
    try {
      await api.delete(`/infos/${id}`);
      setConfirmOpen(false);
      alert("삭제되었습니다.");
      router.push("/");
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "삭제에 실패했습니다.";
      alert(message);
    }
  };

  const canEdit = user && (user.id === info.authorId || user.role === "ADMIN");

  return (
    <div>
      <div className="mx-auto mb-4 flex w-full max-w-3xl items-center justify-between">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← 정보 목록
        </Link>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/info/${info.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded-md border border-rose-300 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <InfoDetail info={info} />

      <DeleteModal
        open={confirmOpen}
        title="이 정보를 삭제하시겠습니까?"
        description={`"${info.title}" 글이 영구적으로 삭제됩니다.`}
        onConfirm={onDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
