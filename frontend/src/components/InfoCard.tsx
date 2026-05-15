import Link from "next/link";
import { Info } from "@/types";

interface Props {
  info: Info;
  href?: string;
}

export default function InfoCard({ info, href }: Props) {
  const target = href ?? `/info/${info.id}`;

  return (
    <Link
      href={target}
      className="group flex h-[320px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-lg"
    >
      <div className="relative h-1/2 w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={info.imageUrl}
          alt={info.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex h-[22%] items-start px-4 pt-3">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 group-hover:text-brand-700">
          {info.title}
        </h3>
      </div>

      <div className="flex h-[28%] flex-wrap content-start items-start gap-1.5 px-4 pb-4 pt-2">
        {info.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-700"
          >
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
