import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpportunityCard } from "@/components/OpportunityCard";
import { PageIntro } from "@/components/PageIntro";
import { categories, getCategory } from "@/lib/categories";
import { listOpportunities } from "@/lib/data";

export async function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  return {
    title: category ? `${category.name} AI Opportunities - TuringScout` : "AI Opportunities - TuringScout",
    description: category?.description,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const { items } = await listOpportunities({ category: category.slug, limit: 40, sort: "rank" });

  return (
    <>
      <PageIntro eyebrow={category.eyebrow} title={category.name} description={category.description} />
      <section className="container-shell pb-16">
        <div className="mb-5 glass rounded-[28px] p-5 text-sm leading-6 text-ink/68">
          Ranking favors official evidence, usefulness, freshness, ease of action, and capped user/social signals. Last updated from current seed data.
        </div>
        {items.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {items.map((opportunity, index) => <OpportunityCard key={opportunity.id} opportunity={opportunity} rank={index + 1} module={`category:${category.slug}`} />)}
          </div>
        ) : (
          <div className="glass rounded-[30px] p-8 text-center">
            <h2 className="text-2xl font-black">The source engine is still scouting this board.</h2>
            <p className="mt-3 text-ink/62">Submit a public source or correction if you know a strong opportunity.</p>
          </div>
        )}
      </section>
    </>
  );
}
