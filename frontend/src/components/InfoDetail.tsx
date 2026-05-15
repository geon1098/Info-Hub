import { Info } from "@/types";
import { categoryLabel } from "@/lib/categories";
import TagList from "./TagList";

interface Props {
  info: Info;
}

type Block =
  | { type: "image"; url: string; alt: string }
  | { type: "paragraph"; text: string };

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;

function parseBody(body: string): Block[] {
  return body
    .split(/\n{2,}/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map<Block>((chunk) => {
      const m = chunk.match(IMAGE_RE);
      if (m) return { type: "image", alt: m[1], url: m[2] };
      return { type: "paragraph", text: chunk };
    });
}

export default function InfoDetail({ info }: Props) {
  const blocks = parseBody(info.body);

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="rounded bg-brand-50 px-2 py-0.5 font-medium text-brand-700">
            {categoryLabel(info.category)}
          </span>
          <span className="text-gray-500">{info.author}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500">
            {new Date(info.createdAt).toLocaleDateString("ko-KR")}
          </span>
          {info.updatedAt && info.updatedAt !== info.createdAt && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400">
                수정 {new Date(info.updatedAt).toLocaleDateString("ko-KR")}
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          {info.title}
        </h1>

        {info.summary && (
          <p className="mt-3 text-base text-gray-600">{info.summary}</p>
        )}

        <TagList tags={info.tags} className="mt-4" />
      </header>

      <div className="overflow-hidden rounded-xl shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={info.imageUrl}
          alt={info.title}
          className="w-full object-cover"
          style={{ aspectRatio: "16 / 9" }}
        />
      </div>

      <div className="mt-8 space-y-5 text-[16px] leading-[1.85] text-gray-800">
        {blocks.map((b, i) =>
          b.type === "image" ? (
            <figure key={i} className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.url}
                alt={b.alt}
                className="w-full rounded-lg shadow-sm"
              />
              {b.alt && (
                <figcaption className="mt-2 text-center text-xs text-gray-500">
                  {b.alt}
                </figcaption>
              )}
            </figure>
          ) : (
            <p key={i} className="whitespace-pre-wrap">
              {b.text}
            </p>
          )
        )}
      </div>
    </article>
  );
}
