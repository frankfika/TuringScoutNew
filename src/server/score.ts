/**
 * Hype Score computation.
 *
 * score = w1*stars_growth + w2*forks_growth + w3*kol_mentions + w4*repo_growth + w5*recency
 *
 * Inputs come from Project.evidences (stars, forks, kol_mentions, repo_growth_24h, hype_score)
 * and timeframe selects how far back we look.
 */

export type Timeframe = "24h" | "48h" | "7d" | "all";

export const TIMEFRAME_HOURS: Record<Timeframe, number> = {
  "24h": 24,
  "48h": 48,
  "7d": 24 * 7,
  "all": 24 * 365 * 5,
};

const WEIGHTS = {
  stars: 0.25,
  forks: 0.15,
  kol: 2.5,
  growth: 0.6,
  hype: 0.5,
};

export type EvidenceLike = {
  metric: string;
  value: number;
  recordedAt: Date | string;
};

export function pickLatestEvidence(
  evidences: EvidenceLike[],
  metric: string,
  windowMs: number,
  now = Date.now(),
): number {
  const within = evidences
    .filter((e) => e.metric === metric)
    .filter((e) => {
      const t = e.recordedAt instanceof Date ? e.recordedAt.getTime() : new Date(e.recordedAt).getTime();
      return now - t <= windowMs;
    });
  if (within.length === 0) {
    // fall back to most recent regardless of window
    const sorted = evidences
      .filter((e) => e.metric === metric)
      .slice()
      .sort((a, b) => {
        const ta = a.recordedAt instanceof Date ? a.recordedAt.getTime() : new Date(a.recordedAt).getTime();
        const tb = b.recordedAt instanceof Date ? b.recordedAt.getTime() : new Date(b.recordedAt).getTime();
        return tb - ta;
      });
    return sorted[0]?.value ?? 0;
  }
  return within.reduce((max, e) => (e.value > max ? e.value : max), 0);
}

export function computeHypeScore(
  evidences: EvidenceLike[],
  timeframe: Timeframe = "24h",
  now = Date.now(),
): number {
  const windowMs = TIMEFRAME_HOURS[timeframe] * 60 * 60 * 1000;

  const stars = pickLatestEvidence(evidences, "stars", windowMs, now);
  const forks = pickLatestEvidence(evidences, "forks", windowMs, now);
  const kol = pickLatestEvidence(evidences, "kol_mentions", windowMs, now);
  const growth = pickLatestEvidence(evidences, "repo_growth_24h", windowMs, now);
  const hypeMetric = pickLatestEvidence(evidences, "hype_score", windowMs, now);

  // log-scale stars / forks so they don't dominate
  const starScore = Math.log10(Math.max(1, stars)) * 100;
  const forkScore = Math.log10(Math.max(1, forks)) * 100;

  const raw =
    WEIGHTS.stars * starScore +
    WEIGHTS.forks * forkScore +
    WEIGHTS.kol * kol +
    WEIGHTS.growth * growth +
    WEIGHTS.hype * hypeMetric;

  // normalize to ~0-1500 range
  return Math.round(raw);
}

export function deriveCardStats(evidences: EvidenceLike[]) {
  const stars = pickLatestEvidence(evidences, "stars", Number.MAX_SAFE_INTEGER);
  const forks = pickLatestEvidence(evidences, "forks", Number.MAX_SAFE_INTEGER);
  const kol = pickLatestEvidence(evidences, "kol_mentions", Number.MAX_SAFE_INTEGER);
  const growth = pickLatestEvidence(evidences, "repo_growth_24h", Number.MAX_SAFE_INTEGER);
  const hype = pickLatestEvidence(evidences, "hype_score", Number.MAX_SAFE_INTEGER);
  return { stars, forks, kol, growth, hype };
}
