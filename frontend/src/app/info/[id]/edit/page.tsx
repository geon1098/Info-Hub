"use client";

import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import InfoEditor from "@/components/InfoEditor";
import { api } from "@/lib/api";
import { Info, InfoDraft } from "@/types";
import { useAuth } from "@/lib/authStore";

export default function InfoEditPage({
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

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get<{ data: Info }>(`/infos/${id}`);
        setInfo(res.data.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFoundFlag(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [id]);

  useEffect(() => {
    if (!info) return;
    if (!user || (user.id !== info.authorId && user.role !== "ADMIN")) {
      alert("수정 권한이 없습니다.");
      router.replace(`/info/${id}`);
    }
  }, [user, info, id, router]);

  if (notFoundFlag) return notFound();
  if (loading || !info) return <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>;

  const initial: InfoDraft = {
    title: info.title,
    imageUrl: info.imageUrl,
    tags: info.tags,
    category: info.category,
    body: info.body,
  };

  const onSubmit = async (draft: InfoDraft) => {
    try {
      await api.put(`/infos/${id}`, draft);
      alert("수정되었습니다.");
      router.push(`/info/${id}`);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "수정에 실패했습니다.";
      alert(message);
    }
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
