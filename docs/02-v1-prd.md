# 02 V1 PRD

Canonical status: current source of truth for V1 product scope.


## Goal

Launch a lightweight, automation-first AI opportunity product that helps users discover AI projects worth trying and helps projects get organic exposure.

## Problem Definition

Users do not need another generic AI directory. They need a fast answer to:

> Which AI project is worth my time today, what can I get from it, how hard is it, and can I trust the source?

Projects do not need fake traffic or another form they must fill out. They need:

> Real users, builders, creators, and early adopters reaching official project links, plus an optional way to submit corrections and official opportunity details.

V1 should therefore optimize for automated discovery, speed of judgment, source trust, and outbound action, not for a heavy community system or submission-dependent marketplace.

Missing social insight:

> TuringScout should not only rank opportunities. It should also rank and recognize the people who discover, explain, validate, and spread those opportunities.

The mechanism is human, not just data-driven: people participate because they can be seen, ranked, acknowledged by projects, and eventually invited into higher-value opportunities. V1 should include a lightweight version of this loop without requiring wallet/token mechanics.

## Product Mantra

> The leaderboard is the surface; the evidence graph is the moat; scout/creator status is the growth loop; Adoptionshare is the future business model.

V1 should therefore collect enough structured data to support future attribution, even when attribution is not exposed publicly yet.

## V1 Execution Boundary

V1 beta follows the M0-M5 development plan:

- M1 is only an internal manual/seed leaderboard slice, not the final V1.
- Launchable V1 means source-backed public leaderboards, raw evidence retention, admin review, AI extraction drafts, explainable scoring, lightweight scout/creator credit, analytics, SEO, and at least one production-safe scheduled source job.
- V1 does not require broad crawling, full social monitoring, default auto-publishing, user login, creator profiles, campaign workflows, wallets, or tokens.
- Any wallet/token/airdrop/high-risk/sponsored/homepage-top-placement item must enter human review before public promotion.
- If V1 signals are weak, improve opportunity quality, sources, explanations, CTA, freshness, and review workflow before expanding into V2/V3.

## V1 Product Hypotheses

- If source registry plus semi-automated discovery keeps the board fresh without heavy manual work, one person can operate the product.
- If users can browse ranked, source-backed AI opportunities without login, they will click official links and return.
- If projects see useful referral traffic and ranked exposure, some will optionally submit official details or corrections.
- If scouts and creators get visible credit for surfacing useful opportunities, some will optionally submit, correct, explain, and share more opportunities.
- If projects see creators driving useful attention, they will repost, correct listings, and later pay for campaigns.
- If AI handles extraction, tagging, scoring suggestions, risk notes, and draft summaries while humans review sensitive cases, a small team can keep the product fresh at low cost.
- If rankings are transparent and sponsored placements are clearly labeled, the product can monetize later without damaging trust.

## Primary User

Opportunity hunters:

- AI users looking for free credits
- early adopters looking for possible points/airdrops
- builders looking for useful open-source projects
- agent users looking for demos/tools
- creators looking for topics and sponsor-worthy projects
- scouts/influencers who want to be recognized for finding and explaining AI opportunities early

## Personas And Jobs To Be Done

### AI Opportunity Hunter

Job:

- Find free credits, points, possible airdrops, early access, and no-login trials before they expire.

Success moment:

- Finds a trustworthy opportunity in under 30 seconds and clicks the official link.

### Builder / Developer

Job:

- Discover useful open-source AI projects, agents, MCP tools, RAG tools, SDKs, integrations, and bounties.

Success moment:

- Opens GitHub, docs, or a bounty page and decides whether to try, star only if genuinely useful, fork, run, contribute, integrate, or benchmark.

### Creator / Researcher

Job:

- Find projects worth testing, comparing, writing about, or making videos/tutorials about.

Success moment:

- Uses the listing, sources, and ranking explanation as a starting point for content.

### AI Scout / Social Influencer

Job:

- Be early to useful AI opportunities, publish useful context, and get recognized for driving attention.

Success moment:

- Their discovered, submitted, corrected, posted, or explained link appears as "spotted by" or "top voice" on a ranked opportunity/project page.

### Project Founder / DevRel

Job:

- Get early users, builders, creators, and trusted social voices to the official website, GitHub repo, docs, demo, or campaign page.

Success moment:

- Submits an official link, sees the listing published, and gets clicks or corrections from relevant users.

## User Promise

每天发现值得薅、值得试、值得关注的 AI 项目：免费额度、积分、潜在空投、Agent 试用、GitHub 项目、开发者赏金、内测资格。

## Project Promise

让 AI 项目低成本获得真实曝光、真实试用、真实开发者关注和可追踪的增长反馈，而不是购买假 star 或垃圾流量。

## Core User Journey

1. User opens homepage without login.
2. User scans today’s AI opportunities.
3. User filters by Free Credits, Possible Airdrop, GitHub, Agent Trial, Bounty, No Login, 5 Min, or Verified.
4. User opens an opportunity detail page.
5. User checks reward, effort, trust, risk, and source.
6. User clicks official outbound link.
7. User optionally subscribes, reports an issue, submits a correction/opportunity, or saves later in V2.

## Core Creator / Scout Journey

1. Creator sees or discovers an AI opportunity.
2. Creator can optionally submit the official URL plus their post/thread/video/article link. In V1, creator/social proof is mostly submitted, manually curated, or sourced from explicitly configured low-risk sources; broad social crawling is later.
3. AI drafts extraction for the project, opportunity, and social proof.
4. Low-risk evidence becomes reviewable or publishable according to admin rules; high-risk, sponsored, ambiguous, or top-placement items must be reviewed.
5. The listing credits the creator as "spotted by", "explained by", or "top voice".
6. Creator receives a share card and has a reason to repost.
7. Project notices useful coverage and may repost, correct, or submit official details.
8. Later, creator profile, score, proof links, and campaign eligibility can be added in V2/V3.

## Core Project Journey

1. System discovers project URL/GitHub/opportunity evidence automatically from public sources.
2. AI extracts draft project/opportunity fields.
3. System scores and risk-labels the listing.
4. Low-risk listing becomes a publishable draft or enters review. V1 beta can keep human approval as the default; high-risk/sponsored/top-placement items always enter review.
5. Project appears in relevant leaderboard.
6. Project can optionally submit official details, corrections, or featured interest after seeing the listing.
7. Project sees which creators/scouts helped surface or explain the opportunity.
8. Later, project can receive ranking notification, report, creator coverage summary, or paid featured/campaign option.

## Pages

### Homepage

Purpose: help users find today’s best AI opportunities quickly.

Sections:

- hero and value proposition
- Today’s Top AI Opportunities
- quick filters
- Spotted by AI Scouts / Top Voices preview
- category leaderboard previews
- Rising Open-Source AI Projects
- Trending AI Agents / MCP Tools
- optional correction/submit CTA
- subscribe CTA

### Category Leaderboard

Purpose: browse a specific opportunity intent.

Initial launch categories should stay focused. Start with 3-4 strong categories before expanding.

Recommended V1 beta categories:

- Open-Source AI Momentum
- AI Agents / MCP Tools
- Free AI Credits / Trials
- AI Bounties / Builder Tasks

Manual-only or later categories:

- AI Points / Possible Airdrops, only after manual review
- RAG Tools
- AI DevTools
- Creator Tasks
- Integration Challenges
- Feedback / Evaluation Tasks

Each page includes:

- category explanation
- ranked cards
- filters
- last updated time
- source/risk legend

### Opportunity Detail

Purpose: decide whether to spend time on an opportunity.

Must answer:

- What is this?
- What can I get?
- What do I need to do?
- How long will it take?
- Is it official or unverified?
- What are the risks?
- Where do I go next?

### Project Page

Purpose: aggregate evidence and opportunities for a project.

Includes:

- project summary
- official links
- GitHub metrics if available
- active opportunities
- ranking appearances
- top scouts/creators and useful social proof links
- source evidence
- risk/credibility notes
- similar projects

### Submit / Correction Page

Purpose: optional no-login submission, correction, risk report, and creator credit.

This page is not the operating backbone. The product should run even if nobody submits a link.

Required fields:

- URL
- type: project / opportunity / free credits / GitHub repo / agent / bounty / correction / risk report

Optional fields:

- note
- contact
- social handle
- content/post URL if the submitter published context
- budget/featured interest

AI extracts everything else.

### Methodology Page

Purpose: build trust.

Explains:

- ranking logic
- AI role
- human review triggers
- labels
- sponsored policy
- V1 limitations
- report/update flow

## Opportunity / Task Taxonomy

V1 opportunities should be classified by both category and action type.

| Action type | User motivation | Project value | Typical difficulty |
| --- | --- | --- | --- |
| Free Credit Task | immediate value | signup, activation, trial | 1-5 min |
| Points / Possible Airdrop | future upside | early community and usage | 5-30 min |
| GitHub Discovery | learning, reputation, useful repo discovery | authentic stars, forks, issues, PRs | 1-30 min |
| Agent Trial | useful workflow, content material | usage, feedback, demos | 5-30 min |
| Content Task | audience, reputation, sponsor potential | education, distribution | 30 min-2 hr |
| Integration Task | portfolio, bounty, technical depth | ecosystem adoption | 30 min-2 hr+ |
| Feedback / Evaluation | easy contribution | product improvement | 5-30 min |

Difficulty levels:

- Level 1: 1-minute click, visit, waitlist, simple claim.
- Level 2: 5-minute try, browser demo, onboarding, quick feedback.
- Level 3: 30-minute builder task, local run, API test, comparison.
- Level 4: 2-hour contributor task, tutorial, PR, integration, benchmark.
- Level 5: deep campaign, case study, enterprise pilot, complex workflow.

Public copy rule:

- Say `discover, test, support, contribute, explain, or build`.
- Do not say or imply `guaranteed stars`, `guaranteed airdrop`, or `risk-free reward`.

## V1 Scope Priority

### P0: Launch Must-Haves

- Public homepage leaderboard
- Category leaderboards
- Opportunity detail pages
- Project pages
- Source registry and raw evidence intake
- Admin review/publish/reject/merge/expire workflow
- At least one production-safe scheduled source job that creates RawEvidence and reviewable AI drafts
- Optional no-login submit/correction page
- Evidence/source links on every listing
- Trust, risk, reward, time, and difficulty labels
- GitHub metric enrichment for GitHub-linked projects
- AI extraction, summaries, tags, and ranking explanations
- Scout/creator credit fields: discovered by / submitted by / explained by / corrected by
- Social proof links on detail pages when available
- Lightweight manually curated `/scouts` page or Top Voices module
- Shareable cards for top listings
- Review queue for risky, ambiguous, sponsored, or top-placement items
- Outbound click tracking
- Core analytics events
- Methodology page
- Basic subscribe CTA

### P1: Fast Follow

- Weekly archive pages
- Weekly AI opportunity report draft
- Share cards for ranked projects/opportunities
- Richer Weekly AI Scouts / Top Voices module
- Creator-ready snippets based on source-backed listing facts
- Project ranking notification drafts
- Creator/scout recognition notification drafts
- Broken/expired link checks
- Founder dashboard for daily operations
- Basic correction workflow for projects and users
- Queue-based source discovery and AI extraction hardening
- Auto-publish feature flag for low-risk items only after review quality is proven

### P2: Later / Not Required For V1 Launch

- Login and saved opportunities
- Completed/attempted status
- Proof link submission
- Creator/scout profiles
- full Top Voices leaderboard
- Project claim flow
- Paid campaign workflow
- API/data products
- Points, wallet, token, or reward escrow

## Opportunity Card Requirements

Each card should show:

- project name
- opportunity hook
- reward/upside type
- estimated time
- difficulty
- trust label
- risk label
- why ranked
- spotted by / social proof count when available
- primary CTA

Primary CTAs:

- Go claim
- View official task
- Open GitHub
- Try agent
- View bounty
- Read source

## Labels

Trust labels:

- Official Source
- Verified
- Unverified
- User Submitted
- Auto Discovered
- AI Summary
- Last Checked

Risk/commercial labels:

- Reward Not Guaranteed
- Sponsored
- Featured
- Partner Campaign
- High Risk
- Requires Login
- Requires Wallet
- No Clear Reward Terms
- Possible Spam Task
- No Login
- Ending Soon

Utility/action labels:

- Free Credits
- Possible Airdrop
- GitHub
- Open Source
- Agent Trial
- API Trial
- Bounty
- Creator Task
- Builder Task
- Integration Task
- Feedback Task
- No Login
- 5 Min
- Beginner Friendly
- High EV
- New
- Trending

## V1 Metrics

North star:

- qualified outbound clicks to official AI project links

Supporting metrics:

- return visitors
- optional project submissions/corrections
- optional opportunity submissions/corrections
- optional creator/scout submissions
- social proof links discovered or submitted
- ranking card shares
- creator-to-outbound click contribution
- project acknowledgements/reposts
- reviewable draft generation rate
- auto-publish rate, only if low-risk auto-publish is enabled behind a feature flag
- review queue size
- subscriber growth
- top category CTR
- sponsored/featured inquiries

## Metric Definitions

- Qualified outbound click: a click from TuringScout to an official project/opportunity/GitHub link, deduplicated by visitor and opportunity within a short time window, excluding obvious bots and admin traffic.
- Valid submission: an optional submitted URL that resolves, is relevant to AI, and contains enough evidence to create or update a project/opportunity candidate.
- Valid social proof: a post, thread, article, video, benchmark, tutorial, or discussion link that adds useful context about a project/opportunity and is not low-quality spam.
- Creator/scout contribution: a valid discovery, explanation, validation, tutorial, comparison, benchmark, or source correction tied to a project/opportunity.
- Reviewable draft generation rate: percentage of source candidates or submissions that produce useful project/opportunity drafts for admin review.
- Auto-publish rate: percentage of low-risk candidates published without human review after passing source, risk, duplicate, and confidence checks. This can be zero in V1 beta if manual approval remains the default.
- Review queue size: number of unresolved items requiring human judgment, grouped by risk, value, ambiguity, sponsored status, or top-placement status.
- Return visitor: a non-admin visitor who comes back after a previous session and views at least one leaderboard or detail page.

## Launch Acceptance Criteria

V1 is launchable when:

- A new user can open the homepage, understand the product, filter opportunities, open a detail page, and click an official link without login.
- Every published opportunity has at least one source URL, a last-checked timestamp, a trust label, a risk label, and a primary CTA.
- Listings can optionally credit a scout/creator without requiring full login, while hiding sensitive contact details.
- Social proof links are clearly separated from official sources so users do not confuse creator content with official project claims.
- No wallet/token/high-risk/speculative reward opportunity auto-publishes without review.
- Sponsored or featured placements are visually labeled and do not affect organic ranking.
- Admin can approve, reject, edit, merge duplicates, expire, or mark listings for review.
- At least one scheduled source job can create RawEvidence and reviewable AI drafts; other sources can still be manual/import during beta.
- Core analytics events are captured: impression, detail view, outbound click, filter apply, submit URL, subscribe, and report issue.
- Category/detail pages are SEO-indexable and have clear canonical titles/descriptions.
- The site starts with enough supply to feel useful: ideally 50-100 seeded listings across the initial categories.
- Each published listing has raw evidence retained internally so it can be reprocessed, audited, and used for future reports.

## Key Product Risks

- Low trust if AI-generated summaries are not visibly source-backed.
- Low retention if listings are stale or too generic.
- Weak growth loop if creators/scouts do not get enough visible credit to share.
- Spam risk if creator scoring rewards volume instead of quality.
- Low project participation if the project-side value is not obvious.
- Ranking abuse if clicks/submissions are weighted too heavily.
- Over-automation risk if AI publishes or promotes sensitive items before enough trust and QA exist.
- Legal/compliance risk if speculative airdrop or reward language sounds guaranteed.
- Monetization trust risk if sponsored placements look organic.

## V1 Non-Goals

- no token
- no DAO governance
- no wallet connection
- no reward escrow
- no guaranteed GitHub stars
- no full social crawling
- no mandatory login
- no complex reputation system
- no automated payouts
- no default auto-publishing for high-risk, sponsored, wallet/token, speculative reward, or homepage top-placement items
