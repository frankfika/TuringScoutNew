import { requireAdmin } from "@/lib/admin";
import { publicEnvSnapshot } from "@/lib/env";

export default async function SettingsPage() {
  await requireAdmin();
  const env = publicEnvSnapshot();
  return <section className="container-shell pb-16"><h1 className="text-5xl font-black">Settings & health</h1><div className="glass mt-6 rounded-[30px] p-6"><h2 className="text-2xl font-black">Environment validation</h2><p className="mt-2 text-sm text-ink/60">Runtime: {env.runtime} / DB configured: {String(env.databaseConfigured)} / Site URL: {env.siteUrl}</p><div className="mt-4 grid gap-3">{env.issues.length ? env.issues.map((issue) => <div key={issue.key + issue.message} className="rounded-2xl bg-white/50 p-4"><p className="font-black">{issue.severity}: {issue.key}</p><p className="text-sm text-ink/60">{issue.message}</p></div>) : <p className="rounded-2xl bg-emerald-100 p-4 font-bold text-emerald-900">No environment issues detected for this runtime.</p>}</div></div></section>;
}
