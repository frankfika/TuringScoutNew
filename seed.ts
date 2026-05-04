import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ProjectInput = {
  slug: string;
  name: string;
  description: string;
  url: string;
  githubUrl: string;
  language: string;
  topics: string[];
  category: string;
  status: string;
  baseStars: number;
  baseForks: number;
  baseKolMentions: number;
  baseGrowth: number;
  baseHype: number;
  highlights: string[];
  suitableFor: string;
  comparisons: { name: string; difference: string }[];
  totalScore: number;
  dimensionScores: Record<string, { score: number; explanation: string }>;
  opportunities: {
    slug: string;
    title: string;
    description: string;
    type: string;
    rewardValue?: string;
    requirements?: string;
    actionUrl: string;
    status: "PUBLISHED" | "CANDIDATE";
  }[];
};

const PROJECTS: ProjectInput[] = [
  {
    slug: "langchain",
    name: "LangChain",
    description: "Building applications with LLMs through composability — the de-facto orchestration framework for production AI agents.",
    url: "https://langchain.com",
    githubUrl: "https://github.com/langchain-ai/langchain",
    language: "Python",
    topics: ["llm", "python", "framework", "agents", "rag"],
    category: "LLM_ORCHESTRATION",
    status: "ACTIVE",
    baseStars: 92500,
    baseForks: 14800,
    baseKolMentions: 18,
    baseGrowth: 36,
    baseHype: 92,
    highlights: [
      "Industry-standard for LLM apps with broadest integration ecosystem",
      "First-class support for both Python and TypeScript stacks",
      "Battle-tested patterns for RAG, tool use, and multi-agent flows",
    ],
    suitableFor: "Python and JS developers building production AI applications grounded in their own data.",
    comparisons: [
      { name: "LlamaIndex", difference: "LangChain is more general-purpose / agentic; LlamaIndex shines specifically at RAG indexing." },
      { name: "Haystack", difference: "LangChain has a richer agent abstraction; Haystack focuses on classical search pipelines." },
    ],
    totalScore: 95.5,
    dimensionScores: {
      "AI Relevance": { score: 100, explanation: "Core infrastructure for modern AI apps" },
      "Momentum": { score: 95, explanation: "Stars and contributors growing weekly" },
      "Credibility": { score: 96, explanation: "Backed by major VCs, huge community" },
      "Accessibility": { score: 90, explanation: "Open source, free to use" },
    },
    opportunities: [
      {
        slug: "langchain-open-source",
        title: "LangChain Open Source Framework",
        description: "Build context-aware LLM applications with the leading open source orchestration framework.",
        type: "OPEN_SOURCE",
        rewardValue: "Open Source",
        requirements: "Familiarity with Python or TypeScript",
        actionUrl: "https://github.com/langchain-ai/langchain",
        status: "PUBLISHED",
      },
      {
        slug: "langchain-bounty",
        title: "Integration Bounty: Add Provider X",
        description: "Open bounty for contributors to add support for emerging LLM providers.",
        type: "COMPETITION",
        rewardValue: "$500 USDC",
        requirements: "Open PR to langchain-ai/langchain",
        actionUrl: "https://github.com/langchain-ai/langchain/issues",
        status: "PUBLISHED",
      },
    ],
  },
  {
    slug: "babyagi",
    name: "BabyAGI",
    description: "Lightweight task-driven autonomous agent loop demonstrating planner / executor / context-aware patterns.",
    url: "https://github.com/yoheinakajima/babyagi",
    githubUrl: "https://github.com/yoheinakajima/babyagi",
    language: "Python",
    topics: ["agents", "autonomous", "python", "research"],
    category: "LLM_ORCHESTRATION",
    status: "ACTIVE",
    baseStars: 19500,
    baseForks: 2700,
    baseKolMentions: 9,
    baseGrowth: 18,
    baseHype: 78,
    highlights: [
      "Clear, minimal autonomous-agent reference implementation",
      "Easy to fork and extend for custom domains",
      "Active community of remixers and researchers",
    ],
    suitableFor: "Researchers and indie builders prototyping novel autonomous agent loops.",
    comparisons: [
      { name: "AutoGPT", difference: "BabyAGI is lighter and more readable; AutoGPT is more feature-loaded." },
    ],
    totalScore: 84,
    dimensionScores: {
      "AI Relevance": { score: 92, explanation: "Pioneered modern autonomous-agent loops" },
      "Momentum": { score: 75, explanation: "Steady but no longer hyper-trending" },
      "Credibility": { score: 86, explanation: "Authored by well-known researcher" },
      "Accessibility": { score: 95, explanation: "Tiny codebase, easy to read" },
    },
    opportunities: [
      {
        slug: "babyagi-fork-jam",
        title: "BabyAGI Fork Jam",
        description: "Hack on BabyAGI variants and submit to the showcase for community recognition.",
        type: "COMPETITION",
        rewardValue: "Featured spot + swag",
        requirements: "Submit a working fork",
        actionUrl: "https://github.com/yoheinakajima/babyagi",
        status: "PUBLISHED",
      },
    ],
  },
  {
    slug: "freqtrade",
    name: "Freqtrade",
    description: "Open-source crypto trading bot with strategy backtesting, hyperopt, and live exchange integration.",
    url: "https://www.freqtrade.io",
    githubUrl: "https://github.com/freqtrade/freqtrade",
    language: "Python",
    topics: ["trading", "crypto", "defi", "bot", "python"],
    category: "DEFI_TRADING",
    status: "ACTIVE",
    baseStars: 28400,
    baseForks: 5800,
    baseKolMentions: 7,
    baseGrowth: 14,
    baseHype: 70,
    highlights: [
      "Mature trading framework with hyperopt and backtesting",
      "Supports many major exchanges out of the box",
      "Vibrant Discord community sharing strategies",
    ],
    suitableFor: "Quant developers who want a hackable, self-hosted crypto trading bot.",
    comparisons: [
      { name: "Hummingbot", difference: "Freqtrade emphasizes individual strategy iteration; Hummingbot emphasizes market-making." },
    ],
    totalScore: 82,
    dimensionScores: {
      "AI Relevance": { score: 70, explanation: "ML-assisted hyperopt; not core LLM" },
      "Momentum": { score: 72, explanation: "Steady community pulse" },
      "Credibility": { score: 90, explanation: "Long-running, audited public codebase" },
      "Accessibility": { score: 88, explanation: "Self-hostable, Docker-friendly" },
    },
    opportunities: [
      {
        slug: "freqtrade-strategy-bounty",
        title: "Strategy Authoring Bounty",
        description: "Submit a profitable, well-documented strategy module to win community grant.",
        type: "POINTS_REWARD",
        rewardValue: "1,000 community points",
        requirements: "Open PR with backtest evidence",
        actionUrl: "https://github.com/freqtrade/freqtrade",
        status: "CANDIDATE",
      },
    ],
  },
  {
    slug: "elizaos",
    name: "ElizaOS",
    description: "Multi-agent simulation framework for social bots and persona-driven autonomous agents.",
    url: "https://elizaos.ai",
    githubUrl: "https://github.com/elizaOS/eliza",
    language: "TypeScript",
    topics: ["agents", "social", "bots", "typescript"],
    category: "SOCIAL_BOTS",
    status: "ACTIVE",
    baseStars: 14200,
    baseForks: 1900,
    baseKolMentions: 14,
    baseGrowth: 52,
    baseHype: 88,
    highlights: [
      "Strong persona / character abstraction for social agents",
      "First-class plugin system with rapid ecosystem growth",
      "Heavy KOL adoption in agent-Twitter communities",
    ],
    suitableFor: "Builders shipping persona-driven agents on Twitter, Discord, Telegram.",
    comparisons: [
      { name: "AutoGen", difference: "Eliza is product-focused on social bot personas; AutoGen is research-oriented multi-agent." },
    ],
    totalScore: 86,
    dimensionScores: {
      "AI Relevance": { score: 95, explanation: "Direct agent infra" },
      "Momentum": { score: 92, explanation: "Trending fast in last 30 days" },
      "Credibility": { score: 78, explanation: "Younger but quickly maturing" },
      "Accessibility": { score: 80, explanation: "Open source with active starter kits" },
    },
    opportunities: [
      {
        slug: "elizaos-plugin-bounty",
        title: "ElizaOS Plugin Bounty",
        description: "Build and ship an Eliza plugin that integrates a new platform or capability.",
        type: "COMPETITION",
        rewardValue: "$1,000 + featured listing",
        requirements: "Approved PR + demo video",
        actionUrl: "https://github.com/elizaOS/eliza",
        status: "PUBLISHED",
      },
      {
        slug: "elizaos-early-access",
        title: "ElizaOS Cloud Early Access",
        description: "Early access program for the managed Eliza Cloud runtime.",
        type: "FREE_TRIAL",
        rewardValue: "$50 cloud credits",
        requirements: "Active GitHub with public agent",
        actionUrl: "https://elizaos.ai",
        status: "CANDIDATE",
      },
    ],
  },
  {
    slug: "yolov8",
    name: "Ultralytics YOLOv8",
    description: "State-of-the-art real-time object detection, segmentation, and pose models for computer-vision agents.",
    url: "https://docs.ultralytics.com",
    githubUrl: "https://github.com/ultralytics/ultralytics",
    language: "Python",
    topics: ["vision", "detection", "ml", "agents"],
    category: "COMPUTER_VISION",
    status: "ACTIVE",
    baseStars: 31200,
    baseForks: 6200,
    baseKolMentions: 6,
    baseGrowth: 22,
    baseHype: 81,
    highlights: [
      "SOTA detection / segmentation accuracy out of the box",
      "Tight Python ergonomics, ONNX / TensorRT export",
      "Foundation for many vision-augmented agent stacks",
    ],
    suitableFor: "Engineers building vision-aware agents and edge perception pipelines.",
    comparisons: [
      { name: "Detectron2", difference: "YOLOv8 is faster to train and deploy; Detectron2 has richer research toolkit." },
    ],
    totalScore: 88,
    dimensionScores: {
      "AI Relevance": { score: 90, explanation: "Foundational perception layer" },
      "Momentum": { score: 80, explanation: "Stable, widely adopted" },
      "Credibility": { score: 92, explanation: "Maintained by Ultralytics, commercial backing" },
      "Accessibility": { score: 85, explanation: "Permissive license, easy install" },
    },
    opportunities: [
      {
        slug: "yolov8-edge-challenge",
        title: "Edge Perception Challenge",
        description: "Submit a YOLOv8-based edge agent demo on resource-constrained devices.",
        type: "COMPETITION",
        rewardValue: "$2,000 grant",
        requirements: "Open-source demo repo",
        actionUrl: "https://github.com/ultralytics/ultralytics",
        status: "PUBLISHED",
      },
    ],
  },
  {
    slug: "gymnasium",
    name: "Gymnasium",
    description: "Standard reinforcement-learning environment API powering modern RL agents and benchmarks.",
    url: "https://gymnasium.farama.org",
    githubUrl: "https://github.com/Farama-Foundation/Gymnasium",
    language: "Python",
    topics: ["reinforcement-learning", "rl", "agents", "research"],
    category: "REINFORCEMENT_LEARNING",
    status: "ACTIVE",
    baseStars: 7400,
    baseForks: 850,
    baseKolMentions: 4,
    baseGrowth: 9,
    baseHype: 64,
    highlights: [
      "Successor to OpenAI Gym, the canonical RL env API",
      "Maintained by Farama Foundation with strong governance",
      "Bridges classical RL research and modern agent loops",
    ],
    suitableFor: "RL researchers and agent builders evaluating policies in standard environments.",
    comparisons: [
      { name: "PettingZoo", difference: "Gymnasium covers single-agent RL; PettingZoo extends the same API to multi-agent." },
    ],
    totalScore: 79,
    dimensionScores: {
      "AI Relevance": { score: 80, explanation: "Critical for RL-flavored agents" },
      "Momentum": { score: 65, explanation: "Steady but niche" },
      "Credibility": { score: 92, explanation: "Backed by Farama Foundation" },
      "Accessibility": { score: 88, explanation: "Open API, well-documented" },
    },
    opportunities: [
      {
        slug: "gymnasium-env-contribution",
        title: "Add a New Environment",
        description: "Contribute a high-quality RL environment to the Gymnasium core.",
        type: "OPEN_SOURCE",
        rewardValue: "Maintainer mention",
        requirements: "Open RFC + PR",
        actionUrl: "https://github.com/Farama-Foundation/Gymnasium",
        status: "PUBLISHED",
      },
    ],
  },
  {
    slug: "autogen",
    name: "AutoGen",
    description: "Multi-agent conversation framework from Microsoft Research enabling complex agent collaboration patterns.",
    url: "https://microsoft.github.io/autogen",
    githubUrl: "https://github.com/microsoft/autogen",
    language: "Python",
    topics: ["multi-agent", "llm", "microsoft", "research", "agents"],
    category: "LLM_ORCHESTRATION",
    status: "ACTIVE",
    baseStars: 34200,
    baseForks: 4900,
    baseKolMentions: 22,
    baseGrowth: 48,
    baseHype: 89,
    highlights: [
      "Research-grade multi-agent orchestration with conversation patterns",
      "Backed by Microsoft Research with active academic community",
      "Supports human-in-the-loop and tool-augmented agent flows",
    ],
    suitableFor: "Researchers and engineers building complex multi-agent systems with rich interaction patterns.",
    comparisons: [
      { name: "LangChain", difference: "AutoGen focuses on multi-agent conversations; LangChain is broader orchestration." },
      { name: "CrewAI", difference: "AutoGen is research-oriented; CrewAI is production-focused with role-based agents." },
    ],
    totalScore: 91,
    dimensionScores: {
      "AI Relevance": { score: 98, explanation: "Cutting-edge multi-agent research" },
      "Momentum": { score: 88, explanation: "Strong growth in research community" },
      "Credibility": { score: 95, explanation: "Microsoft Research backing" },
      "Accessibility": { score: 82, explanation: "Steeper learning curve but well-documented" },
    },
    opportunities: [
      {
        slug: "autogen-research-grant",
        title: "Multi-Agent Research Grant",
        description: "Submit a research proposal using AutoGen for novel multi-agent applications.",
        type: "COMPETITION",
        rewardValue: "$5,000 research grant",
        requirements: "Research proposal + working prototype",
        actionUrl: "https://github.com/microsoft/autogen",
        status: "PUBLISHED",
      },
    ],
  },
];

const TICKER_ITEMS = [
  { text: "🔥 LangChain releases v0.3 with first-class agent runtimes", link: "https://github.com/langchain-ai/langchain", priority: 90 },
  { text: "💰 ElizaOS plugin bounty pool just doubled to $20k", link: "https://github.com/elizaOS/eliza", priority: 85 },
  { text: "🧠 BabyAGI fork wins community jam — full reasoning trace open-sourced", link: "https://github.com/yoheinakajima/babyagi", priority: 70 },
  { text: "📈 Freqtrade strategy contest hit 1.2k submissions in 24h", link: "https://github.com/freqtrade/freqtrade", priority: 65 },
  { text: "👁️ YOLOv8 edge demo on Raspberry Pi 5 trends on HackerNews", link: "https://github.com/ultralytics/ultralytics", priority: 60 },
  { text: "🤖 Gymnasium 1.0 stabilizes RL env API after years of churn", link: "https://github.com/Farama-Foundation/Gymnasium", priority: 50 },
  { text: "⚡ TuringScout radar detected 3 new LLM-orchestration repos breaking 1k stars this week", link: null as string | null, priority: 40 },
  { text: "🛰️ Daily AI agent ecosystem signal: total active KOL volume up 18%", link: null as string | null, priority: 30 },
];

const COMMUNITY_POSTS: Array<{
  type: "tweet" | "ai_summary";
  author: string;
  handle: string;
  avatar: string;
  content: string;
  rating?: string;
  likes?: number;
  retweets?: number;
  projectSlug?: string;
  minutesAgo: number;
}> = [
  { type: "tweet", author: "Agent News", handle: "@agentnews", avatar: "A", content: "🔥 LangChain just shipped streaming-first agent runtimes. The pattern feels like the new default.", likes: 412, retweets: 88, projectSlug: "langchain", minutesAgo: 2 },
  { type: "ai_summary", author: "TuringScout AI", handle: "@turing_eval", avatar: "🤖", content: "ElizaOS shows a 52% week-over-week stars growth, with KOL mentions up 4x. Signal: high-confidence breakout in social-bot category.", rating: "High Impact", projectSlug: "elizaos", minutesAgo: 4 },
  { type: "tweet", author: "Tech Radar", handle: "@techradar", avatar: "T", content: "📈 Persona-driven agents are eating Twitter. ElizaOS plugins are everywhere now.", likes: 89, retweets: 12, projectSlug: "elizaos", minutesAgo: 7 },
  { type: "tweet", author: "Jane Doe", handle: "@janecodes", avatar: "J", content: "🏆 Just claimed the LangChain integration bounty. Surprisingly clean review process.", likes: 56, retweets: 6, projectSlug: "langchain", minutesAgo: 11 },
  { type: "ai_summary", author: "TuringScout AI", handle: "@turing_eval", avatar: "🤖", content: "BabyAGI activity is plateauing but fork ecosystem remains vibrant — 14 active forks merged upstream patches this week.", rating: "Trend Alert", projectSlug: "babyagi", minutesAgo: 18 },
  { type: "tweet", author: "Quant Owl", handle: "@quantowl", avatar: "Q", content: "📊 Backtesting a new mean-reversion strategy in Freqtrade. Sharpe is suspiciously good — must be overfit.", likes: 41, retweets: 3, projectSlug: "freqtrade", minutesAgo: 26 },
  { type: "ai_summary", author: "TuringScout AI", handle: "@turing_eval", avatar: "🤖", content: "Computer-vision agents trending: YOLOv8 edge deployments crossed 11k weekly downloads on Hugging Face mirrors.", rating: "Ecosystem Growth", projectSlug: "yolov8", minutesAgo: 35 },
  { type: "tweet", author: "RL Researcher", handle: "@rl_research", avatar: "R", content: "🤖 Gymnasium 1.0 is finally here. The single-agent API is rock-solid now.", likes: 67, retweets: 14, projectSlug: "gymnasium", minutesAgo: 50 },
  { type: "tweet", author: "Open Source", handle: "@oss_bot", avatar: "O", content: "🚀 New BabyAGI fork dropped — claims 30% better convergence on long-horizon tasks. Worth a look.", likes: 124, retweets: 33, projectSlug: "babyagi", minutesAgo: 70 },
  { type: "tweet", author: "InfraOps", handle: "@infra_ops", avatar: "I", content: "🏗️ Deploying ElizaOS swarms to production is honestly easier than I expected. The runtime story is solid.", likes: 78, retweets: 19, projectSlug: "elizaos", minutesAgo: 95 },
  { type: "ai_summary", author: "TuringScout AI", handle: "@turing_eval", avatar: "🤖", content: "Cross-category signal: LLM_ORCHESTRATION still dominates KOL share-of-voice (61%), but SOCIAL_BOTS is closing fast (+14 pts MoM).", rating: "Bullish", minutesAgo: 130 },
  { type: "tweet", author: "Swarm Insights", handle: "@swarminst", avatar: "S", content: "🧠 Multi-agent RL benchmark on Gymnasium env hit a new SOTA today. Diff is open for review.", likes: 49, retweets: 8, projectSlug: "gymnasium", minutesAgo: 180 },
];

async function clearDatabase() {
  await prisma.a2ATask.deleteMany({});
  await prisma.paymentRequest.deleteMany({});
  await prisma.agentService.deleteMany({});
  await prisma.agentCard.deleteMany({});
  await prisma.aIReview.deleteMany({});
  await prisma.scoreSnapshot.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.communityPost.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.tickerItem.deleteMany({});
  await prisma.adminSession.deleteMany({});
  await prisma.extraction.deleteMany({});
  await prisma.rawEvidence.deleteMany({});
  await prisma.source.deleteMany({});
}

async function main() {
  console.log("🌱 Seeding TuringScout database...");

  await clearDatabase();

  // Sources
  const sources = [
    { name: "GitHub Trending", url: "https://github.com/trending", type: "GITHUB_TRENDING", tier: "TIER_1", schedule: "0 * * * *" },
    { name: "Hacker News Show", url: "https://news.ycombinator.com/show", type: "HN_SHOW", tier: "TIER_2", schedule: "0 */6 * * *" },
    { name: "Hugging Face Trending", url: "https://huggingface.co/models", type: "HUGGINGFACE", tier: "TIER_2", schedule: "0 */6 * * *" },
  ];
  for (const s of sources) {
    await prisma.source.create({ data: s });
  }

  // Projects + Opportunities + Evidence + Snapshots + AIReviews
  for (const p of PROJECTS) {
    const project = await prisma.project.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        url: p.url,
        githubUrl: p.githubUrl,
        language: p.language,
        topics: JSON.stringify(p.topics),
        category: p.category,
        status: p.status,
        publishedAt: new Date(),
      },
    });

    const now = Date.now();

    // 5 Evidence rows per project (recent)
    const evidenceRows = [
      { projectId: project.id, metric: "stars", value: p.baseStars, recordedAt: new Date(now - 2 * 60 * 60 * 1000) },
      { projectId: project.id, metric: "forks", value: p.baseForks, recordedAt: new Date(now - 2 * 60 * 60 * 1000) },
      { projectId: project.id, metric: "kol_mentions", value: p.baseKolMentions, recordedAt: new Date(now - 60 * 60 * 1000) },
      { projectId: project.id, metric: "repo_growth_24h", value: p.baseGrowth, recordedAt: new Date(now - 30 * 60 * 1000) },
      { projectId: project.id, metric: "hype_score", value: p.baseHype, recordedAt: new Date(now - 10 * 60 * 1000) },
    ];
    for (const e of evidenceRows) {
      await prisma.evidence.create({ data: e });
    }

    // 14 ScoreSnapshots (one per day, last 14 days) — slight wave so chart is alive
    const snapshots: { projectId: string; totalScore: number; dimensions: string; calculatedAt: Date }[] = [];
    for (let d = 13; d >= 0; d--) {
      const dayOffset = d * 24 * 60 * 60 * 1000;
      const noise = Math.sin((p.baseHype + d) * 0.6) * 6 + (Math.random() * 4 - 2);
      const trend = (13 - d) * 0.4; // mild upward trend
      const score = Math.max(20, Math.min(100, p.baseHype - trend + noise));
      snapshots.push({
        projectId: project.id,
        totalScore: Math.round(score * 10) / 10,
        dimensions: JSON.stringify({
          stars: p.baseStars - d * 12,
          forks: p.baseForks - d * 3,
          kol_mentions: Math.max(0, p.baseKolMentions - Math.floor(d / 2)),
        }),
        calculatedAt: new Date(now - dayOffset),
      });
    }
    for (const s of snapshots) {
      await prisma.scoreSnapshot.create({ data: s });
    }

    // Opportunities + AIReview
    for (const opp of p.opportunities) {
      const created = await prisma.opportunity.create({
        data: {
          slug: opp.slug,
          projectId: project.id,
          title: opp.title,
          description: opp.description,
          type: opp.type,
          rewardValue: opp.rewardValue,
          requirements: opp.requirements,
          actionUrl: opp.actionUrl,
          status: opp.status,
          publishedAt: opp.status === "PUBLISHED" ? new Date() : null,
        },
      });

      await prisma.aIReview.create({
        data: {
          projectId: project.id,
          opportunityId: created.id,
          highlights: JSON.stringify(p.highlights),
          suitableFor: p.suitableFor,
          comparisons: JSON.stringify(p.comparisons),
          totalScore: p.totalScore,
          dimensionScores: JSON.stringify(p.dimensionScores),
          aiModel: "gemini-2.5-pro",
        },
      });
    }
  }

  // Community posts
  const projectMap = new Map<string, string>();
  for (const proj of await prisma.project.findMany()) {
    projectMap.set(proj.slug, proj.id);
  }

  for (const post of COMMUNITY_POSTS) {
    await prisma.communityPost.create({
      data: {
        type: post.type,
        author: post.author,
        handle: post.handle,
        avatar: post.avatar,
        content: post.content,
        rating: post.rating,
        likes: post.likes ?? 0,
        retweets: post.retweets ?? 0,
        projectId: post.projectSlug ? projectMap.get(post.projectSlug) ?? null : null,
        publishedAt: new Date(Date.now() - post.minutesAgo * 60 * 1000),
      },
    });
  }

  // Ticker items
  for (const t of TICKER_ITEMS) {
    await prisma.tickerItem.create({
      data: {
        text: t.text,
        link: t.link,
        priority: t.priority,
      },
    });
  }

  // AgentCards + Services (A2A protocol demo)
  const agentCards: Array<{
    projectSlug: string;
    name: string;
    description: string;
    endpointUrl: string;
    walletSolana: string;
    walletEvm: string;
    services: Array<{
      name: string;
      description: string;
      priceUsd: number;
      acceptedChains: string[];
      endpointPath: string;
    }>;
  }> = [
    {
      projectSlug: "langchain",
      name: "LangChain Agent",
      description: "An A2A-enabled agent that answers questions about LangChain ecosystem, docs, and integration patterns.",
      endpointUrl: "https://agent.langchain.com/a2a",
      walletSolana: "GsbwXfJra2a8Pj7vC7yG7Z7X7X7X7X7X7X7X7X7X7X7",
      walletEvm: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      services: [
        { name: "Docs Q\u0026A", description: "Ask any question about LangChain docs and get an instant, sourced answer.", priceUsd: 0, acceptedChains: ["solana", "evm"], endpointPath: "/qa" },
        { name: "Integration Audit", description: "Get a detailed audit of your LangChain integration with best-practice recommendations.", priceUsd: 2.5, acceptedChains: ["solana", "evm"], endpointPath: "/audit" },
      ],
    },
    {
      projectSlug: "elizaos",
      name: "Eliza Persona Agent",
      description: "Social-bot persona agent that can craft tweets, Discord messages, and character backstories.",
      endpointUrl: "https://agent.elizaos.ai/a2a",
      walletSolana: "ElizaSoLanAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
      walletEvm: "0xElizaEvm00000000000000000000000000000001",
      services: [
        { name: "Persona Draft", description: "Generate a unique character persona for your social bot.", priceUsd: 0.5, acceptedChains: ["solana"], endpointPath: "/persona" },
        { name: "Tweet Thread", description: "Craft a viral tweet thread in your character\u0027s voice.", priceUsd: 1.0, acceptedChains: ["solana", "evm", "htx"], endpointPath: "/tweet" },
      ],
    },
    {
      projectSlug: "freqtrade",
      name: "FreqQuant Agent",
      description: "Quant research agent that analyzes strategies, backtests configs, and suggests optimizations.",
      endpointUrl: "https://agent.freqtrade.io/a2a",
      walletSolana: "FreqSoLanAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
      walletEvm: "0xFreqEvm000000000000000000000000000000001",
      services: [
        { name: "Strategy Review", description: "Upload your strategy JSON and get a risk / performance review.", priceUsd: 3.0, acceptedChains: ["evm", "htx"], endpointPath: "/review" },
      ],
    },
  ];

  for (const a of agentCards) {
    const projId = projectMap.get(a.projectSlug);
    if (!projId) continue;
    const agent = await prisma.agentCard.create({
      data: {
        projectId: projId,
        name: a.name,
        description: a.description,
        endpointUrl: a.endpointUrl,
        walletSolana: a.walletSolana,
        walletEvm: a.walletEvm,
        capabilities: JSON.stringify(["text", "json", "streaming"]),
      },
    });
    for (const s of a.services) {
      await prisma.agentService.create({
        data: {
          agentId: agent.id,
          name: s.name,
          description: s.description,
          priceUsd: s.priceUsd,
          acceptedChains: JSON.stringify(s.acceptedChains),
          endpointPath: s.endpointPath,
        },
      });
    }
  }

  console.log(`✅ Seeded ${PROJECTS.length} projects, ${COMMUNITY_POSTS.length} community posts, ${TICKER_ITEMS.length} ticker items, ${agentCards.length} agents.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
