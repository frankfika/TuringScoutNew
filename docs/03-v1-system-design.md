# 03 V1 System Design

Canonical status: current source of truth for V1 technical logic.


## Goal

Build a low-cost, automation-first, evidence-first pipeline that turns public sources and GitHub data into ranked AI opportunities with minimal human operation.

## System Principle

Every listing should be source-backed.

Every AI summary, score, label, and risk note should trace to evidence.

## V1 Data Flow

```text
Source registry + public sources + optional user/project/creator submissions
  -> Raw evidence store
  -> AI extraction
  -> Project / Opportunity / CreatorContent candidates
  -> Entity resolution and deduplication
  -> GitHub / website / link graph enrichment
  -> Scoring engine + risk engine
  -> Review queues
  -> Public leaderboards and pages
  -> Scout/creator credit + share cards
  -> Outbound click and submission tracking
  -> Ranking/report/outreach feedback loop
```

## Core Concepts

- `Source`: configured source or source family where discovery can happen.
- `RawEvidence`: immutable raw/source-backed discovery record before AI processing.
- `Evidence`: cleaned, linked, and summarized source record attached to a project/opportunity/content item.
- `Project`: canonical AI project profile.
- `Opportunity`: reward/task/launch opportunity tied to a project.
- `GithubMetricSnapshot`: time-series GitHub metrics.
- `LinkGraphEdge`: relationship between project, opportunity, source, creator content, and outbound links.
- `ScoreSnapshot`: ranking score and explanation over time.
- `RiskAssessment`: risk labels, review triggers, and risk rationale.
- `ReviewQueueItem`: items needing human review.
- `OutboundClick`: internal click/interest signal.
- `Submission`: optional user/project submitted URL, correction, risk report, or creator credit input.
- `Creator`: optional scout/creator identity, initially lightweight and platform-agnostic.
- `CreatorContent`: post/thread/video/article/tutorial submitted as social proof.
- `CreatorScoreSnapshot`: quality-weighted influence contribution over time.
- `ProjectAcknowledgement`: project-side repost, reply, correction, or official acknowledgement.

## Minimal Data Requirements

### Project

Required fields:

- name
- slug
- short summary
- category/tags
- official website URL if available
- GitHub URL if available
- status: draft / published / hidden / archived
- trust label
- risk notes
- last checked time

Useful optional fields:

- docs URL
- blog URL
- Hugging Face URL
- ProductHunt/HN/Reddit/source URLs
- contact or submitter email
- logo/image
- similar projects

### Opportunity

Required fields:

- project reference
- opportunity title/hook
- opportunity type
- reward/upside type
- estimated time
- difficulty
- task steps
- primary CTA URL
- source/evidence URLs
- trust label
- risk labels
- score and score explanation
- status: draft / review / published / expired / rejected
- last checked time

Useful optional fields:

- expiration date
- eligibility region
- account/login requirement
- wallet requirement
- sponsor/featured flag
- review reason
- admin notes


### Raw Evidence

Required fields:

- source type
- source name
- source URL
- discovered time
- fetched time when available
- raw title
- raw text excerpt or cleaned text when available
- raw HTML/JSON snapshot optional
- author/source account when available
- published time when known
- linked URLs
- language
- fetch status
- checksum/hash

Reasons to keep raw evidence:

- avoid repeated fetching
- preserve provenance
- support audit/reprocessing
- reduce AI hallucination
- enable future reports and attribution

### Evidence

Required fields:

- source type
- source URL
- fetched/submitted time
- raw title/description when available
- extracted text or summary
- confidence score
- linked project/opportunity candidate

### Creator / Scout

Required fields for lightweight V1 credit:

- display name or handle
- submitted URL or content URL
- platform/source type
- public attribution preference
- linked project/opportunity
- status: pending / visible / hidden / rejected

Useful optional fields:

- contact email
- avatar
- profile URL
- role: scout / creator / researcher / project member
- notes
- quality score

### Creator Content

Required fields:

- creator reference when available
- content URL
- platform/source type
- linked project/opportunity
- extracted title/summary
- content type: post / thread / video / article / tutorial / benchmark / review / correction
- quality label
- risk/spam label
- submitted time

## Source Strategy

Tier 1: automated free / low-cost / high-signal backbone:

- GitHub search, trending, topics, repo API, awesome lists
- official project websites
- official docs/blogs/RSS
- Hugging Face public pages

Tier 2: selective public discovery and evidence:

- HN public search/pages
- ProductHunt public pages/manual importer
- Reddit public/RSS links where allowed and practical
- Dev.to, Medium/Substack/company blog public archives
- arXiv / Papers with Code for research-to-product signals

Tier 3: optional submitted/manual evidence:

- user-submitted URLs
- project-submitted URLs
- submitted X links
- submitted WeChat/Zhihu/Bilibili/Xiaohongshu/Jike links
- submitted Discord/Telegram links
- submitted creator posts, videos, tutorials, benchmarks, or reviews

Do not claim complete coverage of X, WeChat, Zhihu, Reddit, or the entire AI market in V1.

Practical rule:

> Monitor a small number of high-signal sources deeply. Submissions and scout/creator links are optional corrections, credits, and gap-fillers, not the operating backbone.

## Source Registry

Each source should be tracked in a lightweight registry so discovery can become agent-driven later.

Required fields:

- source name
- source type
- source URL or query template
- category mapping
- priority: high / medium / low
- frequency: daily / weekly / manual
- fetch method: API / RSS / public page / submitted only / manual
- allowed use notes
- last checked time
- enabled flag

Initial registry examples:

- GitHub query: `AI agent`, `MCP server`, `RAG`, `LLM app`, `coding agent`, `eval framework`, `vector database`, `browser agent`
- HN query: `Show HN AI`, `AI agent`, `MCP`, `open source AI`
- Hugging Face: trending Spaces, models, datasets related to agents/tools
- ProductHunt: AI launches via manual/import flow
- Chinese/social: submitted links and manual weekly curation only

## Entity Resolution And Deduplication

Use deterministic matching first:

- same official domain
- same GitHub URL
- same Hugging Face org/model/space URL
- same normalized project name
- same official social handle
- same canonical docs or product URL

Then use AI-assisted fuzzy matching:

- similar names
- similar descriptions
- shared founders/team mentions
- shared logo/title metadata
- overlapping source links

Candidate outcomes:

- new project
- duplicate of existing project
- new opportunity for existing project
- duplicate opportunity
- ambiguous, needs review

Ambiguous merges must go to human review.

## Enrichment Jobs

### GitHub Enrichment

Collect:

- stars
- forks
- watchers
- open issues
- pull requests if practical
- contributors count if practical
- releases
- topics
- README summary
- license
- last commit / last pushed
- created and updated dates

Derived metrics:

- star velocity
- fork velocity
- recent activity score
- contributor growth proxy
- release freshness
- issue health
- maintainer responsiveness proxy
- repo credibility score

### Website Enrichment

Collect:

- title and meta description
- docs/pricing/free tier/API pages
- GitHub/Hugging Face links
- RSS/blog links
- waitlist or credits page
- terms/reward clarity signals

### Link Graph Enrichment

Track relationships:

- Project -> GitHub repo
- Project -> opportunities
- Project -> official/social/source links
- Opportunity -> source evidence
- Opportunity -> creator content
- CreatorContent -> project/opportunity
- Submission -> project/opportunity/content

## AI Responsibilities

AI should:

- extract project/opportunity fields from URLs
- summarize source pages
- classify opportunity type
- generate tags
- estimate difficulty and time
- create risk labels
- explain ranking rationale
- draft SEO metadata and digest copy
- suggest duplicate matches
- classify creator/social proof content
- draft share cards and creator/project notification copy
- detect low-quality, spammy, or unsupported creator claims

AI should not final-approve:

- speculative airdrops
- wallet/token tasks
- high-value unclear rewards
- sponsored placements
- homepage top placements
- project correction disputes
- creator score disputes
- paid or reward-bearing creator campaign results

## Review Rules

Auto-publish is allowed when:

- source is official or high-confidence public GitHub/open-source evidence
- risk score is low
- no wallet/private key request
- no fake-star/spam wording
- not sponsored
- not homepage top placement

Human review is required when:

- reward is high but unclear
- airdrop/token/wallet is mentioned
- official source is missing
- AI confidence is low
- duplicate match is ambiguous
- item is sponsored or paid
- user reports risk
- item enters homepage top placements
- creator content includes reward claims, attacks, financial advice, or suspicious engagement
- creator/scout credit affects a public weekly top list

## Ranking Logic

Core components:

- opportunity value
- credibility
- momentum
- ease
- freshness
- AI relevance
- capped user interest
- capped social proof
- risk penalty

User interest and social proof signals must be abuse-aware. Clicks, submissions, and creator posts cannot dominate rankings.

## V1 Scoring Formula

Use a simple explainable score first, then tune with real data:

```text
organic_score =
  0.25 * opportunity_value
+ 0.20 * credibility
+ 0.15 * momentum
+ 0.15 * ease
+ 0.10 * freshness
+ 0.10 * AI_relevance
+ 0.03 * capped_user_interest
+ 0.02 * capped_social_proof
- risk_penalty
```

Component guidance:

- Opportunity value: free credits, bounty value, early access value, developer usefulness, or clear upside.
- Credibility: official source, GitHub quality, docs quality, verified project submission, and source consistency.
- Momentum: GitHub stars/forks growth, recent commits, launch recency, ProductHunt/HN/Reddit attention where available.
- Ease: lower effort and clearer steps score higher for opportunity-hunter categories; builder categories can tolerate higher effort.
- Freshness: new or recently updated opportunities score higher; stale links decay.
- AI relevance: AI-native products, agent tools, MCP tools, RAG tools, AI DevTools, model/tooling infrastructure.
- Capped user interest: outbound clicks, saves later, submissions, and reports, capped to avoid manipulation.
- Capped social proof: useful creator posts, tutorials, benchmarks, community discussions, and project acknowledgements, capped to avoid influencer farming.
- Risk penalty: unclear rewards, wallet requirements, spam-like tasks, missing official source, suspicious domains, or user reports.

Every public score should expose a plain-language "why ranked" explanation instead of showing only a number.

## Candidate State Machine

```text
submitted/discovered
  -> extracted
  -> deduplicated
  -> enriched
  -> scored
  -> auto_publish OR needs_review
  -> published OR rejected
  -> refreshed / expired / archived
```

State rules:

- `published` items must have source URLs, labels, score explanation, and CTA.
- `needs_review` items cannot appear in organic top placements until approved.
- `expired` items can remain visible only if clearly marked as expired or archived.
- `rejected` items keep internal evidence and rejection reason for abuse prevention and future duplicate checks.

## Creator Influence Logic

TuringScout should measure creator/scout contribution separately from organic opportunity ranking.

Directional V1 formula:

```text
creator_contribution_score =
  0.30 * content_quality
+ 0.20 * project_relevance
+ 0.15 * evidence_usefulness
+ 0.15 * engagement_quality
+ 0.10 * consistency
+ 0.10 * project_acknowledgement
- spam_or_claim_risk_penalty
```

Guidance:

- Content quality: original explanation, tutorial, benchmark, comparison, or useful context beats generic reposting.
- Project relevance: content should clearly map to a real project/opportunity.
- Evidence usefulness: content links to official sources, GitHub, docs, demos, or reproducible results.
- Engagement quality: useful replies, project replies, saves, comments, or community discussion matter more than raw likes.
- Consistency: repeated high-quality discovery or explanation over time.
- Project acknowledgement: official project reply, repost, correction, or listing update is a strong signal.
- Risk penalty: low-effort AI slop, copy-paste threads, fake engagement, undisclosed sponsorship, financial advice, or unsupported reward claims.

V1 can start with manual/admin scoring and visible credit, then automate after enough examples exist.

## Sponsored Policy

Sponsored placements can appear only in labeled modules.

Sponsored status must not improve organic ranking.

Verified badges cannot be bought.

Paid creator campaigns must be labeled separately from organic creator/scout recognition.

## Low-Cost Constraints

Avoid in V1:

- paid X API dependency
- paid social listening tools
- proxy-heavy crawling
- full WeChat/Zhihu crawling
- reward escrow infrastructure
- wallet/token systems

Use instead:

- GitHub public data
- automated source registry
- optional submitted URLs
- public pages/RSS where practical
- internal click data
- cached AI extraction
- scheduled jobs / OpenClaw workers

## Agent / OpenClaw Workflow

Minimal agent stack:

1. Source Scout / Discovery agent
2. Collector agent
3. Opportunity extraction agent
4. Entity merge / dedupe agent
5. GitHub intelligence agent
6. Website/link graph enrichment agent
7. Risk and trust agent
8. Scoring agent
9. Publishing/digest agent
10. Outreach/report/cleanup agent

Queue design:

- `raw_evidence_queue`
- `extraction_queue`
- `dedupe_queue`
- `enrichment_queue`
- `risk_review_queue`
- `publish_queue`
- `human_review_queue`
- `creator_content_queue`
- `outreach_queue`
- `report_queue`
- `cleanup_queue`

Autonomy levels:

- Level 0: manual seed data.
- Level 1: agents draft, human publishes.
- Level 2: low-risk/high-confidence items auto-publish.
- Level 3: agents generate notification/report drafts, human approves sending.
- Level 4: semi-autonomous growth ops after trust is established.

Daily founder dashboard should show only:

- high-value new opportunities
- high-risk queue
- top ranking changes
- broken/expired links
- paid/sponsored leads
- new creator/scout submissions
- project acknowledgements or repost opportunities
- daily digest draft

Target human workload:

- Launch/manual seed: 45-90 minutes/day.
- V1 with admin queue: 20-45 minutes/day.
- V1.5 with agents and low-risk auto-publish: 10-20 minutes/day plus 1-2 hours/week.

## Admin / Ops Requirements

Admin should be able to:

- review candidate evidence, AI extraction, score components, and risk reasons
- approve, reject, edit, expire, or merge listings
- mark source as official/unverified
- force review for homepage/category top placements
- label sponsored/featured modules
- view broken links and stale listings
- see daily ranking changes and suspicious click/submission patterns
- approve, reject, hide, or merge creator/scout credits
- flag low-quality creator content or undisclosed sponsorship
- generate share cards and outreach drafts for creators/projects

## Analytics Events

Track at minimum:

- `leaderboard_view`
- `opportunity_impression`
- `opportunity_detail_view`
- `outbound_click`
- `filter_apply`
- `submit_url`
- `submit_social_proof`
- `share_card_click`
- `creator_credit_view`
- `project_acknowledgement`
- `subscribe_submit`
- `report_issue`
- `admin_decision`

Required event properties:

- opportunity ID where relevant
- project ID where relevant
- category
- source module
- CTA type
- trust/risk labels at click time
- sponsored/featured flag
- timestamp
