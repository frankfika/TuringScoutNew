import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { categories } from "@/lib/categories";

export default function LeaderboardsPage() {
  return (
    <>
      <PageIntro eyebrow="Leaderboards" title="Browse by intent, not hype." description="Each board is backed by official evidence, risk notes, and a clear next action." />
      <section className="container-shell grid gap-5 pb-16 md:grid-cols-2">
        {categories.map((category) => (
          <Link key={category.slug} href={`/leaderboards/${category.slug}`} className="glass rounded-[30px] p-7 transition hover:-translate-y-1 hover:shadow-glow">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-moss">{category.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">{category.name}</h2>
            <p className="mt-4 text-pretty leading-7 text-ink/65">{category.description}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
