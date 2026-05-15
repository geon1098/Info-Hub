"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authStore";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuth();

  const handleLogout = () => {
    clear();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("accessToken");
    }
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-600">InfoHub</span>
          <span className="hidden text-xs text-gray-500 sm:inline">
            정보 공유 커뮤니티
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className={
              pathname === "/"
                ? "font-semibold text-brand-600"
                : "text-gray-700 hover:text-brand-600"
            }
          >
            정보
          </Link>
          <Link
            href="/posts"
            className={
              pathname.startsWith("/posts")
                ? "font-semibold text-brand-600"
                : "text-gray-700 hover:text-brand-600"
            }
          >
            커뮤니티
          </Link>

          {user ? (
            <>
              <Link
                href="/posts/new"
                className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
              >
                글쓰기
              </Link>
              <Link
                href="/mypage"
                className={
                  pathname === "/mypage"
                    ? "font-semibold text-brand-600"
                    : "text-gray-700 hover:text-brand-600"
                }
              >
                마이페이지
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-rose-600 hover:text-rose-700"
                >
                  관리자
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-800"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-brand-600"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-brand-600 px-3 py-1.5 text-brand-600 hover:bg-brand-50"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
