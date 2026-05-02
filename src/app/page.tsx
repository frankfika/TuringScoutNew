import Link from "next/link";
import { OpportunityCard } from "@/components/OpportunityCard";
import { categories } from "@/lib/categories";
import { getTopOpportunities, getVisibleCreators } from "@/lib/data";

export default async function Home() {
  const [opportunities, creators] = await Promise.all([getTopOpportunities(10), getVisibleCreators()]);

  return (
    <>
      <section className="container-shell grid gap-8 py-14 md:grid-cols-[1.12fr_0.88fr] md:py-20">
        <div className="animate-float-in">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.32em] text-moss">AI opportunity board</p>
          <h1 className="text-balance text-5xl font-black tracking-[-0.06em] md:text-7xl">AI opportunities worth trying today.</h1>
          <p className="mt-6 max-w-2xl text-pretty text-xl leading-9 text-ink/68">
            See what to try, why it ranks, what you might get, how hard it is, and which official evidence backs it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/leaderboards" className="rounded-full bg-ink px-6 py-4 text-center font-black text-sand shadow-glow transition hover:-translate-y-1 hover:bg-moss">
              Explore opportunities
            </Link>
            <Link href="/submit" className="rounded-full border border-ink/15 bg-white/55 px-6 py-4 text-center font-black transition hover:-translate-y-1 hover:bg-white">
              Submit correction or proof
            </Link>
          </div>
        </div>
        <aside className="glass animate-float-in rounded-[34px] p-6 [animation-delay:120ms]">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-moss">Today&apos;s signal</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric value={opportunities.length} label="ranked now" />
            <Metric value={categories.length} label="core categories" />
            <Metric value={creators.length} label="visible scouts" />
            <Metric value="0" label="wallet required by default" />
          </div>
          <p className="mt-6 rounded-3xl bg-mint/40 p-4 text-sm leading-6 text-ink/70">
            V1 keeps creator context separate from official sources and records every CTA click as an interest signal.
          </p>
        </aside>
      </section>

      <section className="container-shell py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-moss">Ranked board</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Today&apos;s Top AI Opportunities</h2>
          </div>
          <Link href="/leaderboards" className="hidden rounded-full bg-white/60 px-4 py-2 text-sm font-bold md:block">View all</Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {opportunities.map((opportunity, index) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} rank={index + 1} module="homepage" />
          ))}
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/leaderboards/${category.slug}`} className="glass rounded-[28px] p-5 transition hover:-translate-y-1 hover:shadow-glow">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-moss">{category.eyebrow}</p>
              <h3 className="mt-3 text-xl font-black">{category.name}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/62">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="glass rounded-[34px] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-moss">Spotted by AI Scouts</p>
              <h2 className="mt-2 text-3xl font-black">Useful creator context gets credit.</h2>
            </div>
            <Link href="/scouts" className="rounded-full bg-moss px-5 py-3 text-center font-black text-white">Meet scouts</Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {creators.slice(0, 3).map((creator) => (
              <div key={creator.id} className="rounded-3xl bg-white/50 p-5">
                <p className="font-black">{creator.handle ?? creator.displayName}</p>
                <p className="mt-1 text-sm text-ink/55">{creator.role ?? "scout"} / quality {creator.qualityScore ?? "curated"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return <div className="rounded-3xl bg-white/55 p-4"><p className="text-3xl font-black">{value}</p><p className="text-sm text-ink/55">{label}</p></div>;
}
