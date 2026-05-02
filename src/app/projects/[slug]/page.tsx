import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { OpportunityCard } from "@/components/OpportunityCard";
import { asStringArray } from "@/lib/format";
import { getProjectBySlug } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return {
    title: project ? `${project.name} AI Opportunities | TuringScout` : "Project | TuringScout",
    description: project?.summary ?? undefined,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || project.status !== "published") notFound();

  const risks = asStringArray(project.riskLabels);
  const github = project.githubSnapshots[0];

  return (
    <section className="container-shell py-12">
      <div className="glass rounded-[34px] p-6 md:p-9">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-moss">Project profile</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">{project.name}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">{project.summary}</p>
        <div className="mt-6 flex flex-wrap gap-2"><Badge value={project.trustLabel} />{risks.map((risk) => <Badge key={risk} value={risk} />)}</div>
        <div className="mt-8 flex flex-wrap gap-3">
          {project.officialWebsiteUrl ? <a className="rounded-full bg-ink px-5 py-3 font-black text-sand" href={project.officialWebsiteUrl} target="_blank" rel="noreferrer">Official site</a> : null}
          {project.githubUrl ? <a className="rounded-full bg-white/60 px-5 py-3 font-black" href={project.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}
          <Link className="rounded-full bg-white/60 px-5 py-3 font-black" href="/submit">Submit correction</Link>
        </div>
      </div>

      {github ? (
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="Stars" value={github.stars ?? "--"} />
          <Metric label="Forks" value={github.forks ?? "--"} />
          <Metric label="Issues" value={github.openIssues ?? "--"} />
          <Metric label="License" value={github.license ?? "Unknown"} />
        </div>
      ) : null}

      <section className="py-10">
        <h2 className="mb-5 text-3xl font-black">Active opportunities</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {project.opportunities.map((opportunity, index) => <OpportunityCard key={opportunity.id} opportunity={{ ...opportunity, project }} rank={index + 1} module="project" />)}
        </div>
      </section>

      <section className="grid gap-5 pb-10 md:grid-cols-2">
        <div className="glass rounded-[30px] p-6">
          <h2 className="text-2xl font-black">Source evidence</h2>
          <div className="mt-4 space-y-3">
            {project.evidence.map((evidence) => <a key={evidence.id} href={evidence.sourceUrl} target="_blank" rel="noreferrer" className="block rounded-2xl bg-white/45 p-4 text-sm">{evidence.title ?? evidence.sourceUrl}</a>)}
          </div>
        </div>
        <div className="glass rounded-[30px] p-6">
          <h2 className="text-2xl font-black">Top voices</h2>
          <div className="mt-4 space-y-3">
            {project.creatorContent.length ? project.creatorContent.map((content) => <a key={content.id} href={content.contentUrl} target="_blank" rel="noreferrer" className="block rounded-2xl bg-white/45 p-4 text-sm">{content.creator?.handle ?? content.creator?.displayName}: {content.title}</a>) : <p className="text-ink/62">No approved creator context yet.</p>}
          </div>
        </div>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="glass rounded-[26px] p-5"><p className="text-sm text-ink/50">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}
