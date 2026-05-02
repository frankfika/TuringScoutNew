export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <section className="container-shell grid min-h-[70vh] place-items-center py-12">
      <form action="/api/admin/login" method="post" className="glass w-full max-w-md rounded-[34px] p-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-moss">Admin</p>
        <h1 className="mt-3 text-4xl font-black">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-ink/62">Default local password is configured by `ADMIN_PASSWORD`.</p>
        <input name="password" type="password" required placeholder="Admin password" className="mt-6 w-full rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 outline-none focus:border-moss" />
        {params.error ? <p className="mt-4 rounded-2xl bg-red-100 p-3 text-sm font-bold text-red-900">Wrong password.</p> : null}
        <button className="mt-6 w-full rounded-full bg-ink px-5 py-4 font-black text-sand">Enter admin</button>
      </form>
    </section>
  );
}
