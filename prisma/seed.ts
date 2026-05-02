import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const now = new Date();

const opportunities = [
  {
    project: { slug: "model-context-protocol", name: "Model Context Protocol", category: "ai-agents-mcp", tagline: "Open protocol for connecting AI apps to tools and data", url: "https://modelcontextprotocol.io", github: "https://github.com/modelcontextprotocol/servers", trust: "official", tags: ["mcp", "agents", "tools"] },
    slug: "try-mcp-reference-servers",
    title: "Try MCP reference servers for agent tooling",
    type: "mcp",
    reward: "learning",
    rewardDescription: "Practical agent integration patterns and reusable server examples.",
    cta: "https://github.com/modelcontextprotocol/servers",
    ctaLabel: "Open MCP servers",
    minutes: 25,
    difficulty: "intermediate",
    score: 91,
    risks: ["low"],
    utility: ["builder_task", "github"],
    why: "Official project resources, clear developer action, strong relevance for agent builders.",
    steps: ["Open the official MCP server repository.", "Pick one server that matches your workflow.", "Run it locally and connect it to an MCP-compatible client."],
  },
  {
    project: { slug: "browser-use", name: "browser-use", category: "ai-agents-mcp", tagline: "Make websites accessible for AI agents", url: "https://browser-use.com", github: "https://github.com/browser-use/browser-use", trust: "verified", tags: ["browser", "agent", "automation"] },
    slug: "build-a-browser-agent-demo",
    title: "Build a browser agent demo with browser-use",
    type: "agent_trial",
    reward: "learning",
    rewardDescription: "Hands-on browser automation workflow for AI agents.",
    cta: "https://github.com/browser-use/browser-use",
    ctaLabel: "Try the repo",
    minutes: 35,
    difficulty: "intermediate",
    score: 87,
    risks: ["low"],
    utility: ["builder_task", "github"],
    why: "Open-source agent repo with immediate build path and clear utility.",
    steps: ["Read the quickstart.", "Run a local browser automation task.", "Document one useful workflow or issue."],
  },
  {
    project: { slug: "langgraph", name: "LangGraph", category: "ai-agents-mcp", tagline: "Stateful orchestration for agentic applications", url: "https://langchain-ai.github.io/langgraph/", github: "https://github.com/langchain-ai/langgraph", trust: "official", tags: ["agents", "orchestration", "workflow"] },
    slug: "ship-a-small-langgraph-agent",
    title: "Ship a small LangGraph agent workflow",
    type: "agent_trial",
    reward: "learning",
    rewardDescription: "Reusable agent workflow and better understanding of graph-based orchestration.",
    cta: "https://github.com/langchain-ai/langgraph",
    ctaLabel: "Open LangGraph",
    minutes: 45,
    difficulty: "advanced",
    score: 84,
    risks: ["medium"],
    utility: ["builder_task"],
    why: "High developer relevance and strong official docs; requires more setup than lightweight trials.",
    steps: ["Choose a starter workflow.", "Run the graph locally.", "Add a tool or memory edge and record results."],
  },
  {
    project: { slug: "ollama", name: "Ollama", category: "open-source-ai", tagline: "Run open models locally", url: "https://ollama.com", github: "https://github.com/ollama/ollama", trust: "official", tags: ["local-ai", "models", "developer-tools"] },
    slug: "run-local-model-with-ollama",
    title: "Run a local model with Ollama in minutes",
    type: "github",
    reward: "learning",
    rewardDescription: "Local inference setup and private experimentation path.",
    cta: "https://github.com/ollama/ollama",
    ctaLabel: "Install Ollama",
    minutes: 10,
    difficulty: "beginner",
    score: 93,
    risks: ["low"],
    utility: ["5_min", "github"],
    why: "Very low effort, official links, broad usefulness, and strong open-source momentum.",
    steps: ["Install Ollama from the official source.", "Pull a small model.", "Run a prompt locally and note hardware limits."],
  },
  {
    project: { slug: "llamaindex", name: "LlamaIndex", category: "open-source-ai", tagline: "Data framework for LLM applications", url: "https://www.llamaindex.ai", github: "https://github.com/run-llama/llama_index", trust: "official", tags: ["rag", "data", "llm-apps"] },
    slug: "build-a-rag-starter-with-llamaindex",
    title: "Build a RAG starter with LlamaIndex",
    type: "github",
    reward: "learning",
    rewardDescription: "Reusable retrieval template for docs or internal knowledge bases.",
    cta: "https://docs.llamaindex.ai/",
    ctaLabel: "Open docs",
    minutes: 40,
    difficulty: "intermediate",
    score: 86,
    risks: ["low"],
    utility: ["builder_task"],
    why: "Official docs and open-source repo make this a strong learning and build opportunity.",
    steps: ["Open the starter docs.", "Load one small document set.", "Test retrieval quality with three prompts."],
  },
  {
    project: { slug: "continue", name: "Continue", category: "open-source-ai", tagline: "Open-source AI code assistant", url: "https://www.continue.dev", github: "https://github.com/continuedev/continue", trust: "official", tags: ["coding", "devtools", "open-source"] },
    slug: "try-open-source-coding-assistant-continue",
    title: "Try an open-source coding assistant workflow",
    type: "github",
    reward: "learning",
    rewardDescription: "Evaluate a local or hosted coding-assistant setup.",
    cta: "https://github.com/continuedev/continue",
    ctaLabel: "Open Continue",
    minutes: 20,
    difficulty: "beginner",
    score: 82,
    risks: ["low"],
    utility: ["github", "beginner_friendly"],
    why: "Good open-source fit for developers with clear install and evaluation path.",
    steps: ["Install the extension.", "Connect a model provider or local model.", "Run one refactor and capture quality notes."],
  },
  {
    project: { slug: "openai-cookbook", name: "OpenAI Cookbook", category: "bounties-builder-tasks", tagline: "Examples and guides for building with OpenAI", url: "https://cookbook.openai.com", github: "https://github.com/openai/openai-cookbook", trust: "official", tags: ["examples", "api", "tutorials"] },
    slug: "recreate-an-openai-cookbook-example",
    title: "Recreate a cookbook example and publish notes",
    type: "bounty",
    reward: "learning",
    rewardDescription: "Portfolio-ready implementation notes and reusable starter code.",
    cta: "https://cookbook.openai.com",
    ctaLabel: "Browse examples",
    minutes: 60,
    difficulty: "intermediate",
    score: 81,
    risks: ["medium"],
    utility: ["builder_task"],
    why: "Official examples are reliable, but value depends on the builder documenting learnings.",
    steps: ["Pick one current cookbook example.", "Recreate it in a small repo.", "Write a short note on setup, costs, and pitfalls."],
  },
  {
    project: { slug: "autogen", name: "AutoGen", category: "bounties-builder-tasks", tagline: "Framework for multi-agent AI applications", url: "https://microsoft.github.io/autogen/", github: "https://github.com/microsoft/autogen", trust: "official", tags: ["agents", "multi-agent", "framework"] },
    slug: "compare-two-autogen-agent-patterns",
    title: "Compare two AutoGen agent patterns",
    type: "bounty",
    reward: "learning",
    rewardDescription: "Benchmark-style content that can help other builders choose patterns.",
    cta: "https://github.com/microsoft/autogen",
    ctaLabel: "Open AutoGen",
    minutes: 75,
    difficulty: "advanced",
    score: 78,
    risks: ["medium"],
    utility: ["builder_task"],
    why: "Strong project momentum and useful comparison angle; requires careful evaluation.",
    steps: ["Choose two official examples.", "Run both on the same task.", "Compare setup, reliability, and cost."],
  },
  {
    project: { slug: "guardrails-ai", name: "Guardrails AI", category: "bounties-builder-tasks", tagline: "Validation and safety for LLM outputs", url: "https://www.guardrailsai.com", github: "https://github.com/guardrails-ai/guardrails", trust: "verified", tags: ["evals", "safety", "validation"] },
    slug: "add-output-validation-to-an-llm-app",
    title: "Add output validation to an LLM app",
    type: "bounty",
    reward: "learning",
    rewardDescription: "Concrete safety improvement for an existing LLM workflow.",
    cta: "https://github.com/guardrails-ai/guardrails",
    ctaLabel: "Open Guardrails",
    minutes: 50,
    difficulty: "intermediate",
    score: 76,
    risks: ["low"],
    utility: ["builder_task", "github"],
    why: "Specific, practical builder task with clear evidence and low speculative risk.",
    steps: ["Pick an app with structured output.", "Add a validation rule.", "Record before/after failure cases."],
  },
  {
    project: { slug: "cloudflare-workers-ai", name: "Cloudflare Workers AI", category: "free-credits-trials", tagline: "Run AI inference on Cloudflare's developer platform", url: "https://developers.cloudflare.com/workers-ai/", github: null, trust: "official", tags: ["serverless", "inference", "trial"] },
    slug: "try-workers-ai-free-tier",
    title: "Test a small Workers AI inference route",
    type: "free_credit",
    reward: "free_credits",
    rewardDescription: "Free-tier or low-cost platform exploration; exact limits may change.",
    cta: "https://developers.cloudflare.com/workers-ai/",
    ctaLabel: "Open docs",
    minutes: 30,
    difficulty: "intermediate",
    score: 80,
    risks: ["reward_not_guaranteed", "terms_may_change"],
    utility: ["builder_task"],
    why: "Official docs and clear developer path, with explicit note that limits can change.",
    steps: ["Check the current official limits.", "Create a minimal route.", "Log latency and cost notes."],
  },
  {
    project: { slug: "hugging-face-spaces", name: "Hugging Face Spaces", category: "free-credits-trials", tagline: "Host ML demos and apps", url: "https://huggingface.co/spaces", github: null, trust: "official", tags: ["hosting", "demos", "models"] },
    slug: "launch-a-small-hugging-face-space",
    title: "Launch a small AI demo on Hugging Face Spaces",
    type: "free_credit",
    reward: "access",
    rewardDescription: "Public demo hosting path; hardware availability and quotas can vary.",
    cta: "https://huggingface.co/spaces",
    ctaLabel: "Open Spaces",
    minutes: 45,
    difficulty: "beginner",
    score: 79,
    risks: ["terms_may_change"],
    utility: ["beginner_friendly"],
    why: "Official platform, high usefulness for builders, and approachable first demo path.",
    steps: ["Review current Space hardware options.", "Fork or create a minimal Gradio demo.", "Publish and add a short README."],
  },
  {
    project: { slug: "modal", name: "Modal", category: "free-credits-trials", tagline: "Cloud compute for AI and data apps", url: "https://modal.com", github: "https://github.com/modal-labs/modal-examples", trust: "official", tags: ["compute", "serverless", "gpu"] },
    slug: "run-a-modal-gpu-example",
    title: "Run a Modal AI example and inspect costs",
    type: "free_credit",
    reward: "access",
    rewardDescription: "Developer trial or free-tier exploration; verify current terms before use.",
    cta: "https://modal.com/docs/examples",
    ctaLabel: "Open examples",
    minutes: 35,
    difficulty: "intermediate",
    score: 77,
    risks: ["reward_not_guaranteed", "terms_may_change"],
    utility: ["builder_task"],
    why: "Useful compute trial path with official examples, but account limits require checking current terms.",
    steps: ["Check current pricing and limits.", "Run one official example.", "Record runtime and cost observations."],
  },
];

const creators = [
  { displayName: "Alice Chen", handle: "@alicebuilds", platform: "github", role: "scout", qualityScore: 86 },
  { displayName: "DevRel Notes", handle: "@devrelnotes", platform: "linkedin", role: "creator", qualityScore: 82 },
  { displayName: "Agent Bench Lab", handle: "@agentbench", platform: "youtube", role: "researcher", qualityScore: 79 },
  { displayName: "RAG Builder", handle: "@ragbuilder", platform: "github", role: "creator", qualityScore: 76 },
  { displayName: "Local AI Daily", handle: "@localaidaily", platform: "other", role: "scout", qualityScore: 74 },
];

async function main() {
  await prisma.analyticsEvent.deleteMany();
  await prisma.outboundClick.deleteMany();
  await prisma.scoreSnapshot.deleteMany();
  await prisma.creatorContent.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.rawEvidence.deleteMany();
  await prisma.githubMetricSnapshot.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.project.deleteMany();
  await prisma.source.deleteMany();
  await prisma.submission.deleteMany();

  const source = await prisma.source.create({
    data: {
      name: "Manual official source intake",
      sourceType: "manual",
      urlOrQuery: "official project docs and repositories",
      categoryHint: "v1-seed",
      priority: "high",
      frequency: "manual",
      fetchMethod: "manual",
      allowedUseNotes: "Seed records use official pages or public repositories. Terms must be checked before automation.",
      enabled: true,
      lastCheckedAt: now,
    },
  });

  const creatorRows = await Promise.all(creators.map((creator) => prisma.creator.create({ data: { ...creator, status: "visible" } })));

  for (let index = 0; index < opportunities.length; index += 1) {
    const item = opportunities[index];
    const project = await prisma.project.upsert({
      where: { slug: item.project.slug },
      update: {},
      create: {
        slug: item.project.slug,
        name: item.project.name,
        tagline: item.project.tagline,
        summary: item.project.tagline,
        category: item.project.category,
        tags: item.project.tags,
        officialWebsiteUrl: item.project.url,
        githubUrl: item.project.github,
        trustLabel: item.project.trust,
        riskLabels: ["low"],
        status: "published",
        lastCheckedAt: now,
      },
    });

    if (item.project.github) {
      await prisma.githubMetricSnapshot.create({
        data: {
          projectId: project.id,
          repoUrl: item.project.github,
          stars: 1000 + index * 731,
          forks: 120 + index * 41,
          watchers: 80 + index * 21,
          openIssues: 12 + index,
          license: "Check repository",
          topics: item.project.tags,
          capturedAt: now,
        },
      });
    }

    const raw = await prisma.rawEvidence.create({
      data: {
        sourceId: source.id,
        sourceType: "manual",
        sourceName: source.name,
        sourceUrl: item.cta,
        discoveredAt: now,
        fetchedAt: now,
        rawTitle: item.title,
        rawTextExcerpt: item.why,
        linkedUrls: [item.cta, item.project.url, item.project.github].filter(Boolean),
        language: "en",
        fetchStatus: "success",
        checksum: `${item.slug}-seed`,
      },
    });

    const opportunity = await prisma.opportunity.create({
      data: {
        projectId: project.id,
        slug: item.slug,
        title: item.title,
        summary: `${item.project.name}: ${item.rewardDescription}`,
        opportunityType: item.type,
        rewardType: item.reward,
        rewardDescription: item.rewardDescription,
        taskSteps: item.steps,
        estimatedMinutes: item.minutes,
        difficulty: item.difficulty,
        primaryCtaUrl: item.cta,
        primaryCtaLabel: item.ctaLabel,
        trustLabel: "official_source",
        riskLabels: item.risks,
        utilityLabels: item.utility,
        sourceConfidence: 82 + (index % 12),
        organicScore: item.score,
        whyRanked: item.why,
        status: "published",
        lastCheckedAt: now,
      },
    });

    await prisma.evidence.create({
      data: {
        projectId: project.id,
        opportunityId: opportunity.id,
        rawEvidenceId: raw.id,
        sourceType: item.project.github ? "github" : "official_site",
        sourceUrl: item.cta,
        title: item.title,
        rawText: item.why,
        aiSummary: item.rewardDescription,
        confidence: 86,
        fetchedAt: now,
        status: "active",
      },
    });

    await prisma.scoreSnapshot.create({
      data: {
        entityType: "opportunity",
        entityId: opportunity.id,
        scoreType: "organic",
        score: item.score,
        components: {
          opportunity_value: 80 + (index % 10),
          source_credibility: 88,
          project_momentum: 70 + index,
          freshness: 75,
          ease_of_action: item.minutes <= 30 ? 90 : 70,
          capped_social_proof: 12,
          risk_penalty: item.risks.includes("medium") ? 8 : 2,
        },
        explanation: item.why,
        createdBy: "seed",
      },
    });

    if (index < creatorRows.length) {
      const creator = creatorRows[index];
      await prisma.creatorContent.create({
        data: {
          creatorId: creator.id,
          projectId: project.id,
          opportunityId: opportunity.id,
          contentUrl: item.cta,
          platform: creator.platform,
          contentType: "article",
          title: `${creator.handle} context on ${item.project.name}`,
          summary: "Curated seed creator context for discovery and explanation credit.",
          contributionType: index % 2 === 0 ? "discovery" : "explanation",
          publicCreditLabel: index % 2 === 0 ? "spotted_by" : "explained_by",
          qualityLabel: "high",
          riskLabels: [],
          isSponsored: false,
          status: "visible",
        },
      });
    }
  }

  await prisma.submission.create({
    data: {
      url: "https://example.com/correction",
      type: "correction",
      note: "Example received submission for admin review.",
      status: "received",
      publicCreditOptIn: false,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
