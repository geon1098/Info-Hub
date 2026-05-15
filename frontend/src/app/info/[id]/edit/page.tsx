"use client";

import { notFound, useRouter } from "next/navigation";
import { use, useMemo } from "react";
import InfoEditor from "@/components/InfoEditor";
import { findInfo } from "@/lib/infoData";
import { InfoDraft } from "@/types";

export default function InfoEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const info = useMemo(() => findInfo(id), [id]);

  if (!info) return notFound();

  const initial: InfoDraft = {
    title: info.title,
    imageUrl: info.imageUrl,
    tags: info.tags,
    category: info.category,
    body: info.body,
  };

  const onSubmit = (draft: InfoDraft) => {
    // TODO: PUT /api/infos/{id} 연결
    console.log("[mock] update info:", id, draft);
    alert("수정되었습니다 (mock).");
    router.push(`/info/${id}`);
  };

  return (
    <InfoEditor
      mode="edit"
      initial={initial}
      onSubmit={onSubmit}
      onCancel={() => router.push(`/info/${id}`)}
    />
  );
}
