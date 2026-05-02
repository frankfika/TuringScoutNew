export const categories = [
  {
    slug: "open-source-ai",
    name: "Open-Source AI Momentum",
    eyebrow: "Repos worth watching",
    description: "Fast-moving AI infra, model tooling, evals, and developer projects with public evidence.",
  },
  {
    slug: "ai-agents-mcp",
    name: "AI Agents / MCP Tools",
    eyebrow: "Agentic workflows",
    description: "MCP servers, browser agents, coding agents, and workflow automation tools that builders can try now.",
  },
  {
    slug: "free-credits-trials",
    name: "Free Credits / Trials",
    eyebrow: "Low-friction trials",
    description: "Official credits, trials, grants, and early-access offers with clear risk notes.",
  },
  {
    slug: "bounties-builder-tasks",
    name: "Bounties / Builder Tasks",
    eyebrow: "Build to learn",
    description: "Developer tasks, examples, integrations, documentation work, and community bounties.",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
