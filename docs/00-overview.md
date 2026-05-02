# 00 Overview

Canonical status: current high-level source of truth for positioning and principles.


## One-Line Positioning

TuringScout is an AI opportunity and adoption leaderboard: users discover AI projects worth trying, and projects earn real attention, usage, GitHub interest, and developer adoption.

## Plain-Language Explanation

If explained simply:

> TuringScout is an automation-first opportunity board for AI projects. It continuously collects public signals from GitHub, official websites, docs, launches, Hugging Face, HN, ProductHunt, RSS/blogs, and optional community submissions, then helps users quickly decide which AI projects are worth trying today.

In Chinese:

> TuringScout 是一个自动化运行的 AI 项目机会榜。它主要从 GitHub、官网、文档、公开发布、Hugging Face、HN、ProductHunt、RSS/博客等公开来源自动发现机会，社区提交只是补充和纠错入口，并清楚标出来源、收益、难度和风险。

Useful analogies:

- Product Hunt for AI opportunities
- GitHub Trending with reward, effort, source, and risk labels
- adoption attribution and creator/scout reputation, added later after V1 proves discovery demand

## What It Is

A lightweight, AI-automated OPC platform that aggregates public AI project signals, turns them into structured opportunities, ranks them fairly, and routes users to official project links.

## What It Is Not

- Not a fake GitHub star marketplace
- Not a full DAO in V1
- Not a token or wallet product in V1
- Not a heavy bounty marketplace in V1
- Not a full social listening company in V1
- Not a platform that requires users to register before browsing

## Core Thesis

AI projects already publish launches, GitHub repos, free credits, points programs, bounties, agent demos, tutorials, and announcements across many channels. The problem is not lack of information; the problem is scattered information, unclear value, unclear risk, and no adoption-oriented ranking.

TuringScout turns scattered public AI project signals into ranked, explainable, source-backed opportunities.

## Core Mechanism

TuringScout's surface is a leaderboard, but the deeper mechanism is a data and incentive network for AI adoption.

It has four layers:

1. **Data layer**: automatically collect public evidence from GitHub, official websites, docs, blogs, Hugging Face, HN, ProductHunt, RSS/public pages, plus optional submissions and creator/social proof.
2. **Ranking/status layer**: turn evidence into Opportunity, Project, and Scout/Top Voices leaderboards.
3. **Attribution/incentive layer**: measure which scouts, creators, builders, and users help projects get discovered, understood, tried, and adopted.
4. **Intelligence/value layer**: turn accumulated adoption data into project reports, campaign design, benchmarks, APIs, and later access/reward eligibility.

TuringScout has three connected rankings:

1. **Opportunity leaderboard**: which AI opportunities are worth trying today.
2. **Project leaderboard**: which AI projects are gaining credible adoption attention.
3. **Scout / Top Voices leaderboard**: who is discovering, explaining, validating, and spreading useful AI opportunities.

The flywheel:

```text
project has opportunity
  -> source/scout/agent discovers it
  -> TuringScout stores raw evidence and extracts structured data
  -> creator explains, validates, benchmarks, or builds around it
  -> TuringScout verifies, ranks, and credits useful contribution
  -> creator/project shares the ranking card
  -> users click official links, try, build, star, submit proof, or report risk
  -> project sees useful attention and updates official information
  -> data improves rankings, reports, and future campaign matching
```

The product should make this loop visible through `Spotted by`, `Explained by`, `Validated by`, `Top Voice`, share cards, project acknowledgements, and later creator/scout profiles.

## Problem / Value Split

User-side problem:

- AI opportunities are scattered across GitHub, ProductHunt, Hugging Face, docs, blogs, Discord, X, WeChat, Zhihu, and creator posts.
- Users cannot quickly tell which opportunities are official, still active, low effort, or risky.
- "Possible airdrop", "free credits", and "agent trial" information is often noisy or speculative.

Project-side problem:

- New AI projects need early users, builders, creators, and GitHub attention, but paid ads are inefficient and fake-star services damage trust.
- Small teams often cannot package their launch, free credits, bounty, or developer task into a clear adoption funnel.
- DevRel and founder teams lack a simple feedback loop showing which public signals generate real interest.

V1 value:

- Users get a fast daily shortlist with source, upside, effort, and risk.
- Projects get official-link traffic, better listing quality, and early evidence of interest.
- The platform builds the evidence layer needed for later attribution, reports, and campaigns.

## Influence And Adoption Mapping

TuringScout should turn useful AI discovery, explanation, and usage into measurable **Adoptionshare**:

- **Mindshare**: who drives useful public attention
- **Buildshare**: who drives GitHub, issues, PRs, docs, examples, integrations
- **Usageshare**: who drives API trials, agent sessions, workflows, demos
- **Creatorshare**: who drives tutorials, benchmarks, comparisons, videos
- **Referralshare**: who drives qualified users, builders, teams, and creators

V1 starts with the leaderboard and evidence layer. V2/V3 add attribution and campaigns.

## OPC Model

OPC means Other People's Content / Context / Campaigns.

TuringScout does not create every campaign. It aggregates and transforms public signals from:

- GitHub
- project websites/docs/blogs
- Hugging Face
- Hacker News
- Reddit
- ProductHunt
- RSS/public blogs and newsletters
- optional user/project submissions
- optional submitted X/WeChat/Zhihu/Bilibili links

The platform adds value through:

- aggregation
- structuring
- deduplication
- scoring
- risk labeling
- AI summaries
- source provenance
- ranking
- routing to official links
- future attribution

## Core Principles

- **Automation-first**: agents should handle discovery, extraction, scoring, publishing, cleanup, and reports.
- **Submission-optional**: user/project submissions are useful for corrections, official updates, and credit, but the product must still run without them.
- **AI-native**: AI powers summarization, tagging, ranking explanations, risk notes, and digest drafts.
- **Evidence-first**: every opportunity, score, and risk note should trace back to source links.
- **Fair ranking**: organic rankings cannot be bought; sponsored placements must be labeled.
- **Low-cost first**: avoid expensive APIs and heavy data vendors until revenue justifies them.
- **Browse-first UX**: users should browse, filter, open details, and click official links without login.
- **Conservative attribution**: only make strong attribution claims when evidence supports them.

## V1 Focus

V1 is:

> Automated public-source discovery + GitHub intelligence + evidence-first AI leaderboards + lightweight scout/creator credit.

V1 should prove:

- users want to browse AI opportunities
- users click official links
- projects can optionally submit official information or corrections
- scouts/creators want public credit when they discover, explain, correct, or validate useful links
- AI can keep listings fresh with low manual work
- rankings can generate useful project-side reports later

## Long-Term Business Logic

TuringScout should not stay a static media site.

The long-term business is an AI adoption intelligence and campaign network:

- **Short term**: free listings, featured slots, digest sponsorships, launch boost packages.
- **Mid term**: project dashboards, creator/builder matching, adoption reports, competitor/category intelligence.
- **Long term**: Adoptionshare data layer, API access, reputation graph, reward distribution infrastructure, premium alpha feeds, and optional network/token mechanics only if utility and compliance are proven.

Product mantra:

> Do not create all content. Create the index, ranking, context, attribution, and incentive layer around existing AI project signals.

Chinese:

> 不是简单 AI 榜单，而是把 AI 项目的关注、试用、贡献、传播和转化，变成可排名、可归因、可运营、可商业化的数据网络。
