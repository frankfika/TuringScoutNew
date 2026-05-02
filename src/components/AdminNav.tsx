import Link from "next/link";

const nav = [
  ["Dashboard", "/admin"],
  ["Review", "/admin/review"],
  ["Sources", "/admin/sources"],
  ["Raw Evidence", "/admin/raw-evidence"],
  ["Opportunities", "/admin/opportunities"],
  ["Submissions", "/admin/submissions"],
  ["Analytics", "/admin/analytics"],
  ["Automation", "/admin/automation"],
  ["Campaigns", "/admin/campaigns"],
  ["Reports", "/admin/reports"],
];

export function AdminNav() {
  return (
    <div className="container-shell py-5">
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-3">
        <nav className="flex flex-wrap gap-2">
          {nav.map(([label, href]) => <Link key={href} href={href} className="rounded-full px-4 py-2 text-sm font-black hover:bg-white/70">{label}</Link>)}
        </nav>
        <form action="/api/admin/logout" method="post"><button className="rounded-full bg-ink px-4 py-2 text-sm font-black text-sand">Logout</button></form>
      </div>
    </div>
  );
}
