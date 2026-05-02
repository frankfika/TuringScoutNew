import { PageIntro } from "@/components/PageIntro";
import { getVisibleCreators } from "@/lib/data";

export default async function ScoutsPage() {
  const creators = await getVisibleCreators();
  return (
    <>
      <PageIntro eyebrow="AI Scouts" title="People who make opportunities legible." description="V1 scout recognition is curated. Public credit is separated from official sources and never reveals private contact data." />
      <section className="container-shell grid gap-5 pb-16 md:grid-cols-3">
        {creators.map((creator) => (
          <article key={creator.id} className="glass rounded-[30px] p-6">
            <p className="text-2xl font-black">{creator.handle ?? creator.displayName}</p>
            <p className="mt-2 text-sm text-ink/55">{creator.role ?? "scout"} / {creator.platform ?? "public web"}</p>
            <div className="mt-5 space-y-3">
              {creator.creatorContent.map((content) => <a key={content.id} href={content.contentUrl} target="_blank" rel="noreferrer" className="block rounded-2xl bg-white/50 p-4 text-sm font-semibold">{content.publicCreditLabel?.replaceAll("_", " ") ?? "credit"}: {content.project?.name ?? content.opportunity?.title}</a>)}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
