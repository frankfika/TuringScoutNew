import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "TuringScout - AI Opportunities Worth Trying Today",
  description: "Evidence-first AI opportunity leaderboards with risk notes, official sources, and scout credit.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "TuringScout - AI Opportunities Worth Trying Today",
    description: "Find AI projects, credits, bounties, and builder opportunities backed by public evidence.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="container-shell py-10 text-sm text-ink/55">
          <div className="glass rounded-[28px] p-6 md:flex md:items-center md:justify-between">
            <p>Organic rankings cannot be bought. Sponsored placements are labeled.</p>
            <p className="mt-2 md:mt-0">Built for evidence-first AI discovery.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
