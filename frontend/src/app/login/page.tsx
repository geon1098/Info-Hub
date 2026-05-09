"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/authStore";
import { MOCK_USER } from "@/lib/mockData";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    // TODO: POST /api/auth/login 연결
    // 현재는 mock 처리
    if (email === MOCK_USER.email) {
      sessionStorage.setItem("accessToken", "mock-access-token");
      setAuth(MOCK_USER, "mock-access-token");
      router.push("/");
      return;
    }

    if (email === "admin@infohub.dev") {
      const admin = { ...MOCK_USER, id: 99, email, nickname: "관리자", role: "ADMIN" as const };
      sessionStorage.setItem("accessToken", "mock-admin-token");
      setAuth(admin, "mock-admin-token");
      router.push("/");
      return;
    }

    setError("이메일 또는 비밀번호가 올바르지 않습니다.");
  };

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
        로그인
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@infohub.dev"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          로그인
        </button>

        <p className="text-center text-xs text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-brand-600 hover:underline">
            회원가입
          </Link>
        </p>
      </form>

      <p className="mt-3 text-center text-[11px] text-gray-400">
        데모: <code>demo@infohub.dev</code> / <code>admin@infohub.dev</code>
      </p>
    </div>
  );
}
