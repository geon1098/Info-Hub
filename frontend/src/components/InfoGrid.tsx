import { Info } from "@/types";
import InfoCard from "./InfoCard";

interface Props {
  items: Info[];
}

export default function InfoGrid({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        표시할 정보가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((info) => (
        <InfoCard key={info.id} info={info} />
      ))}
    </div>
  );
}
