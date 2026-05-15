"use client";

import { useRouter } from "next/navigation";
import InfoEditor from "@/components/InfoEditor";
import { InfoDraft } from "@/types";

export default function InfoCreatePage() {
  const router = useRouter();

  const onSubmit = (draft: InfoDraft) => {
    // TODO: POST /api/infos 연결
    console.log("[mock] create info:", draft);
    alert("등록되었습니다 (mock).");
    router.push("/");
  };

  return (
    <InfoEditor
      mode="create"
      onSubmit={onSubmit}
      onCancel={() => router.push("/")}
    />
  );
}
