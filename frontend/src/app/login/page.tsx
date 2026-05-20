"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/lib/authStore";
import { api } from "@/lib/api";
import { User } from "@/types";

interface LoginResponseData {
  accessToken: string;
  tokenType: string;
  user: User;
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post<{ data: LoginResponseData }>("/auth/login", {
        email,
        password,
      });
      const { accessToken, user } = res.data.data;

      sessionStorage.setItem("accessToken", accessToken);
      setAuth(user, accessToken);
      router.push("/");
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "로그인에 실패했습니다.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
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
            placeholder="you@example.com"
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
          disabled={submitting}
          className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>

        <p className="text-center text-xs text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-brand-600 hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
