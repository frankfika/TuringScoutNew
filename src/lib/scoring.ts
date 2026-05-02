import type { Opportunity } from "@prisma/client";
import { asStringArray } from "@/lib/format";

export function calculateOpportunityScore(opportunity: Pick<Opportunity, "rewardType" | "trustLabel" | "estimatedMinutes" | "difficulty" | "sourceConfidence" | "riskLabels" | "utilityLabels" | "commercialLabel">) {
  const risks = asStringArray(opportunity.riskLabels);
  const utility = asStringArray(opportunity.utilityLabels);
  const opportunityValue = opportunity.rewardType === "free_credits" ? 82 : opportunity.rewardType === "bounty" ? 78 : 72;
  const sourceCredibility = opportunity.trustLabel === "official_source" ? 92 : opportunity.trustLabel === "verified" ? 82 : 60;
  const easeOfAction = opportunity.estimatedMinutes && opportunity.estimatedMinutes <= 15 ? 92 : opportunity.estimatedMinutes && opportunity.estimatedMinutes <= 45 ? 78 : 58;
  const aiRelevance = utility.includes("builder_task") || utility.includes("github") ? 84 : 70;
  const freshness = 78;
  const projectMomentum = 76;
  const cappedUserInterest = 10;
  const cappedSocialProof = 12;
  const riskPenalty = risks.includes("high") ? 36 : risks.includes("medium") ? 14 : risks.includes("reward_not_guaranteed") ? 10 : 4;

  const score =
    0.25 * opportunityValue +
    0.2 * sourceCredibility +
    0.15 * projectMomentum +
    0.12 * freshness +
    0.1 * easeOfAction +
    0.08 * aiRelevance +
    0.05 * cappedUserInterest +
    0.05 * cappedSocialProof -
    riskPenalty;

  return {
    score: Math.max(0, Math.min(100, Math.round(score * 10) / 10)),
    components: {
      opportunity_value: opportunityValue,
      source_credibility: sourceCredibility,
      project_momentum: projectMomentum,
      freshness,
      ease_of_action: easeOfAction,
      AI_relevance: aiRelevance,
      capped_user_interest: cappedUserInterest,
      capped_social_proof: cappedSocialProof,
      risk_penalty: riskPenalty,
      commercial_excluded: Boolean(opportunity.commercialLabel),
    },
  };
}

export function reviewReasonForOpportunity(opportunity: Pick<Opportunity, "opportunityType" | "requiresWallet" | "riskLabels" | "trustLabel" | "commercialLabel" | "sourceConfidence">) {
  const risks = asStringArray(opportunity.riskLabels);
  const reasons = [];
  if (opportunity.requiresWallet) reasons.push("wallet required");
  if (opportunity.opportunityType === "points_airdrop") reasons.push("points/airdrop category");
  if (risks.includes("high")) reasons.push("high risk");
  if (opportunity.trustLabel !== "official_source") reasons.push("missing official source");
  if (opportunity.commercialLabel) reasons.push("sponsored/featured label");
  if ((opportunity.sourceConfidence ?? 0) < 70) reasons.push("low source confidence");
  return reasons.join(", ");
}
