"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import InfoDetail from "@/components/InfoDetail";
import DeleteModal from "@/components/DeleteModal";
import { findInfo } from "@/lib/infoData";

export default function InfoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const info = useMemo(() => findInfo(id), [id]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!info) return notFound();

  const onDelete = () => {
    // TODO: DELETE /api/infos/{id} 연결
    setConfirmOpen(false);
    alert("삭제되었습니다 (mock).");
    router.push("/");
  };

  return (
    <div>
      <div className="mx-auto mb-4 flex w-full max-w-3xl items-center justify-between">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← 정보 목록
        </Link>
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
