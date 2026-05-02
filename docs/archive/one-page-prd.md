# One-Page PRD

## Product Name

AICookieDao

## User Promise

每天发现值得薅的 AI 项目：免费额度、积分、潜在空投、Agent 试用、GitHub 任务、开发者赏金、内测资格。

## Project Promise

让 AI 项目低成本获得真实曝光、真实试用、真实开发者关注和可追踪的增长反馈，而不是购买假 star 或垃圾流量。

## MVP User Journey

1. User opens homepage without login.
2. User sees a curated feed of AI opportunities.
3. User filters by Free Credits / Airdrop / GitHub / Agent / Bounty.
4. User opens a task page and clicks official task link.
5. User optionally saves/completes the task after login.
6. User subscribes to Telegram/newsletter for future opportunities.

## MVP Project Journey

1. Project submits a campaign through a form.
2. AICookieDao reviews credibility, reward clarity, and task quality.
3. Approved opportunity goes live.
4. Users click to the official project link.
5. Project receives a basic report.
6. Project can upgrade to featured placement or a managed campaign.

## Key Pages

- `/` Leaderboard-first opportunity feed
- `/opportunities/[slug]` Task detail
- `/projects/[slug]` Project page
- `/leaderboard` Weekly ranking
- `/submit` Submit project
- `/about` Trust, rules, and positioning

## Core Filters

- Reward: Free Credits, Points, Possible Airdrop, Cash Bounty, Grant, Early Access
- Task: No Login, Signup, GitHub, Agent Trial, API Trial, Content, Integration, Feedback
- Difficulty: 1 Min, 5 Min, 30 Min, 2 Hour, Deep
- Status: New, Trending, Verified, Featured, Ending Soon

## Minimum Data To Launch

- AI-assisted curation pipeline
- 50 opportunities
- 30 projects
- 6 categories
- 1 leaderboard
- 1 submit form
- 1 newsletter/Telegram channel

## North Star Metric

Qualified outbound clicks to AI project opportunities.

## Supporting Metrics

- Return visitors
- Subscriber growth
- Project submissions
- Featured listing revenue
- Saved/completed tasks
- GitHub/project lift reports

## Non-Goals For V1

- Token launch
- Full DAO governance
- Automated reward escrow
- Guaranteed GitHub stars
- Heavy social network
- Complex reputation graph
- Heavy manual campaign operations

## V1 Pricing Hypothesis

- Free listing: curated, no guarantee
- Featured listing: $299-$999 per week
- Launch boost: $999-$2,500
- Developer adoption sprint: $2,000-$5,000
- Report/API: later


## AI Automation Requirement

V1 should use AI to generate summaries, tags, ranking explanations, risk notes, SEO metadata, and weekly digest drafts. Manual work should focus on approval and quality control, not writing every listing from scratch.


## Product Principles

- Automation: AI agents discover, extract, score, rank, summarize, and publish most listings.
- AI-native: every listing should include AI-generated explanation, risk note, and category fit.
- Fairness: organic ranking cannot be bought; sponsored placements must be clearly labeled.


## Version Boundaries

### V1: GitHub + Submission OPC Leaderboard

V1 includes public leaderboards, project/opportunity pages, source-backed evidence, GitHub metric enrichment, no-login submissions, outbound click tracking, AI extraction/scoring/risk labels, and an admin review queue.

V1 does not include full X API monitoring, full WeChat/Zhihu crawling, token mechanics, wallet connection, reward escrow, exact global mindshare, or complex creator payouts.

### V1.5: Automation And Distribution

V1.5 adds OpenClaw/agent jobs, weekly archive pages, AI-generated weekly report drafts, newsletter/Telegram drafts, project ranking notifications, cleanup automation, and shareable ranking cards.

### V2: Lightweight Adoptionshare Attribution

V2 adds optional login, saved/completed tasks, proof link submission, contributor profiles, project claim flow, and conservative project reports. It may report correlated lift, but direct attribution requires evidence.

### V3: Campaign And Reward Network

V3 adds paid adoption campaigns, task templates, contribution leaderboards, manual/semi-automated reward approval, campaign reports, and clearly labeled sponsored placements. Organic ranking remains non-purchasable.

### V4/V5: Intelligence And Access

V4 productizes dashboards, reports, APIs, and trend intelligence. V5 may add off-chain points, reputation tiers, private alpha feeds, and partner reward eligibility. Token optionality is deferred until real utility, compliance, and anti-abuse controls exist.


## V1 UX Principles

- Browse-first: users can browse, filter, open details, and click official links without login.
- Source-backed: every opportunity should show source links, last checked time, and whether the source is official or community-submitted.
- Trust-labeled: cards and detail pages should clearly show Verified, Unverified, Sponsored, Reward Not Guaranteed, AI Summary, Official Source, and High Risk labels.
- One-click outbound: V1 routes users to official project links instead of forcing platform-native task completion.
- Opportunity-hunter first: cards should prioritize reward/upside, time required, difficulty, risk, and CTA over deep analytics.

## V1 Technical Logic

Public sources and submissions become evidence records. AI extracts project/opportunity candidates, deduplicates them, enriches them with GitHub/source metadata, assigns score and risk labels, sends risky items to review, and publishes low-risk items to leaderboards. Outbound clicks and submissions become internal interest data for future Adoptionshare reports.
