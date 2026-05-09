import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-sm text-gray-500">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm text-white"
      >
        홈으로
      </Link>
    </div>
  );
}
