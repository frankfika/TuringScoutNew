import { PageIntro } from "@/components/PageIntro";

const sections = [
  ["Ranking", "Organic ranking weighs opportunity value, source credibility, project momentum, freshness, ease of action, AI relevance, capped user interest, and capped social proof. Sponsored or featured status never lifts organic score."],
  ["AI role", "AI can summarize, extract fields, draft risk notes, and suggest score components. It does not publish sensitive listings by itself."],
  ["Human review", "Wallet, token, airdrop, high-value reward, missing official source, low confidence, duplicate ambiguity, sponsored placement, and homepage Top 10 require admin review."],
  ["Creator credit", "Spotted by, Explained by, and Validated by credit means someone helped discovery or context. It is not official endorsement or reward eligibility."],
  ["Risk policy", "TuringScout does not guarantee rewards, stars, credits, allocations, or project outcomes. Always check official terms."],
];

export default function MethodologyPage() {
  return (
    <>
      <PageIntro eyebrow="Methodology" title="Evidence first. Hype second." description="How TuringScout ranks, labels, reviews, and separates official sources from creator context." />
      <section className="container-shell grid gap-5 pb-16 md:grid-cols-2">
        {sections.map(([title, body]) => <article key={title} className="glass rounded-[30px] p-7"><h2 className="text-2xl font-black">{title}</h2><p className="mt-4 leading-8 text-ink/66">{body}</p></article>)}
      </section>
    </>
  );
}
