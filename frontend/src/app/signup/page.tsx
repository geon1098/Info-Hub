"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password || !form.nickname) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/signup", {
        email: form.email,
        password: form.password,
        nickname: form.nickname,
      });
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      router.push("/login");
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "회원가입에 실패했습니다.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
        회원가입
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
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            닉네임
          </label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={onChange}
            placeholder="2~20자"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="8자 이상"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            비밀번호 확인
          </label>
          <input
            name="passwordConfirm"
            type="password"
            value={form.passwordConfirm}
            onChange={onChange}
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
          {submitting ? "처리 중..." : "가입하기"}
        </button>

        <p className="text-center text-xs text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
