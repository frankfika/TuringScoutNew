export function PageIntro({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="container-shell py-12 md:py-16">
      {eyebrow ? <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-moss">{eyebrow}</p> : null}
      <h1 className="max-w-4xl text-balance text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
      {description ? <p className="mt-5 max-w-3xl text-pretty text-lg leading-8 text-ink/68">{description}</p> : null}
    </section>
  );
}
