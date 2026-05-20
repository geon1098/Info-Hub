"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import InfoEditor from "@/components/InfoEditor";
import { api } from "@/lib/api";
import { Info, InfoDraft } from "@/types";
import { useAuth } from "@/lib/authStore";

export default function InfoCreatePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const onSubmit = async (draft: InfoDraft) => {
    try {
      const res = await api.post<{ data: Info }>("/infos", draft);
      alert("등록되었습니다.");
      router.push(`/info/${res.data.data.id}`);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "등록에 실패했습니다.";
      alert(message);
    }
  };

  return (
    <InfoEditor
      mode="create"
      onSubmit={onSubmit}
      onCancel={() => router.push("/")}
    />
  );
}
