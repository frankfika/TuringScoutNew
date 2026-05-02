import { labelize } from "@/lib/format";

const toneClass: Record<string, string> = {
  official_source: "border-emerald-300/70 bg-emerald-100/80 text-emerald-900",
  verified: "border-emerald-300/70 bg-emerald-100/80 text-emerald-900",
  low: "border-emerald-300/70 bg-emerald-100/70 text-emerald-900",
  medium: "border-amber-300/70 bg-amber-100/70 text-amber-900",
  high: "border-red-300/70 bg-red-100/70 text-red-900",
  reward_not_guaranteed: "border-amber-300/70 bg-amber-100/70 text-amber-950",
  sponsored: "border-slate-300/70 bg-slate-100/80 text-slate-700",
};

export function Badge({ value, children }: { value?: string | null; children?: React.ReactNode }) {
  const key = value ?? "default";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClass[key] ?? "badge text-ink"}`}>
      {children ?? labelize(value)}
    </span>
  );
}
