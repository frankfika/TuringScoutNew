import Link from "next/link";

const nav = [
  ["Leaderboards", "/leaderboards"],
  ["Scouts", "/scouts"],
  ["Methodology", "/methodology"],
  ["Submit", "/submit"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-[#f5efe4]/72 backdrop-blur-2xl">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
          <span className="grid size-9 place-items-center rounded-2xl bg-ink text-sand shadow-glow">TS</span>
          <span>TuringScout</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-4 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white/60 hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/submit" className="rounded-full bg-moss px-4 py-2 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-ink">
          Submit proof
        </Link>
      </div>
    </header>
  );
}
