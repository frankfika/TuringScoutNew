import { useNavigate } from "react-router-dom";
import { useApi } from "@lib/api";

type HealthInfo = { version?: string; status?: string };

export function Methodology() {
  const navigate = useNavigate();
  const health = useApi<HealthInfo>("/api/health");
  const version = health.data?.version || "1.0.0";

  return (
    <div className="p-4 md:p-6 lg:p-10 flex flex-col gap-6 w-full max-w-3xl mx-auto font-sans">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[11px] uppercase tracking-widest font-bold text-[#141414] border border-[#141414] px-4 py-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors bg-white rounded-full"
        >
          ← Back
        </button>
      </div>

      <div className="border border-[#141414] p-6 sm:p-10 bg-white shadow-[4px_4px_0_0_#141414] relative rounded-md">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50" aria-hidden="true"></div>
        <h1 className="font-serif font-bold text-3xl sm:text-5xl tracking-tight mb-2 text-[#141414]">
          TuringScout
        </h1>
        <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-sm border border-indigo-200 mb-10">
          Methodology &amp; Protocol &middot; v{version}
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-[#141414]">
          <section>
            <h3 className="text-[13px] font-mono uppercase tracking-widest font-bold mb-4 border-b-2 border-gray-100 pb-2 text-blue-800">
              Data Sources
            </h3>
            <ul className="space-y-4 list-none pl-0">
              <li className="bg-gray-50 p-4 rounded-md border border-gray-200 flex items-start gap-3 shadow-sm">
                <span className="text-xl" aria-hidden="true">🐙</span>
                <div>
                  <strong className="block text-lg">GitHub Trending</strong>
                  <span className="opacity-70 text-sm">
                    Hourly scrape of trending AI/agent repositories. Repos are deduplicated by slug
                    and enriched with stars, forks and KOL mentions.
                  </span>
                </div>
              </li>
              <li className="bg-gray-50 p-4 rounded-md border border-gray-200 flex items-start gap-3 shadow-sm">
                <span className="text-xl" aria-hidden="true">📰</span>
                <div>
                  <strong className="block text-lg">Hacker News &amp; Show</strong>
                  <span className="opacity-70 text-sm">
                    Aggregated community signal for hype detection and momentum scoring.
                  </span>
                </div>
              </li>
              <li className="bg-gray-50 p-4 rounded-md border border-gray-200 flex items-start gap-3 shadow-sm">
                <span className="text-xl" aria-hidden="true">🤗</span>
                <div>
                  <strong className="block text-lg">Hugging Face</strong>
                  <span className="opacity-70 text-sm">
                    Models &amp; Spaces tracking for state-of-the-art model releases.
                  </span>
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-blue-50 p-6 rounded-md border border-blue-100 shadow-sm relative">
            <h3 className="text-[13px] font-mono uppercase tracking-widest font-bold mb-4 border-b border-blue-200 pb-2 text-blue-800">
              Sync Frequencies
            </h3>
            <ul className="space-y-3 list-none pl-2 font-mono text-sm">
              <li className="flex justify-between border-b border-blue-100/50 pb-2">
                <span className="opacity-70">GitHub Trending</span>
                <strong>Hourly</strong>
              </li>
              <li className="flex justify-between border-b border-blue-100/50 pb-2">
                <span className="opacity-70">HN / HF</span>
                <strong>Every 6 hours</strong>
              </li>
              <li className="flex justify-between pb-1">
                <span className="opacity-70">AI Inference</span>
                <strong>On-demand</strong>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-[13px] font-mono uppercase tracking-widest font-bold mb-4 border-b-2 border-gray-100 pb-2 text-blue-800">
              Hype Score
            </h3>
            <div className="space-y-3 text-[14px]">
              <p>
                The Hype Score combines log-scaled stars and forks, KOL mentions, recent repo growth,
                and a published baseline hype signal. Different time windows (24H, 48H, 7D, all-time)
                weight recent evidence differently.
              </p>
              <pre className="bg-[#141414] text-[#E4E3E0] p-4 rounded-sm font-mono text-[12px] overflow-x-auto">
{`hype = log10(stars + 1) * w_stars
     + log10(forks + 1) * w_forks
     + kol_mentions      * w_kol
     + repo_growth_24h   * w_growth
     + baseline_hype     * w_recency`}
              </pre>
              <p className="opacity-80 text-[13px]">
                Editorial review gates every opportunity before it goes public. AI scores are advisory.
              </p>
            </div>
          </section>

          <section className="text-center pt-8 border-t border-dashed border-gray-300">
            <div className="text-[11px] font-mono uppercase tracking-widest font-bold mb-4 text-gray-500">
              Contact / Proposal
            </div>
            <a
              href="mailto:hello@turingscout.com"
              className="font-serif text-2xl font-bold tracking-tight text-blue-600 hover:text-blue-800 transition-colors"
            >
              hello@turingscout.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
