# Product, Tech, And UX Logic

## 1. V1 Product Logic

V1 should be an AI opportunity discovery and ranking product, not a heavy task marketplace.

The first user should feel:

> I can open AICookieDao, quickly see which AI projects are worth trying today, understand what I can get, judge the risk, and click the official link without registering.

The first project team should feel:

> If our AI project has a useful repo, free credits, an agent demo, a bounty, or an early-user opportunity, AICookieDao can surface it to hunters and builders with low setup cost.

## 2. Core V1 Flywheel

### User Flywheel

1. User visits a public leaderboard without login.
2. User sees fresh AI opportunities with reward, difficulty, source, and risk labels.
3. User clicks official links to try, claim, star, test, or learn.
4. User returns for new rankings or subscribes to alerts.
5. User eventually submits new opportunities or saves/completes tasks.

### Data Flywheel

1. Public sources and user/project submissions create evidence.
2. AI extracts structured project and opportunity records.
3. GitHub and source metadata enrich the records.
4. Scoring/risk logic ranks opportunities.
5. Outbound clicks and submissions become owned interest data.
6. Better data improves rankings and future reports.

### Project Flywheel

1. Project appears organically or submits itself.
2. AICookieDao sends users to official project links.
3. Project receives exposure and traffic.
4. Project submits better official information or corrections.
5. Project may later buy featured distribution, reports, or campaigns.

## 3. V1 User Priority

The primary V1 user is the **opportunity hunter**.

This includes:

- AI users looking for free credits
- early adopters looking for possible points/airdrops
- builders looking for useful open-source AI projects
- agent users looking for demos and tools
- creators looking for topics and sponsor-worthy projects

V1 should optimize for:

1. Fast discovery
2. Clear reward/upside
3. Clear effort required
4. Clear trust/risk labels
5. One-click official outbound action
6. Optional subscription or save later

V1 should not force:

- account creation before browsing
- complex proof submission
- platform-native task completion
- wallet connection
- social posting
- reward claiming inside AICookieDao

## 4. Technical Logic

### V1 Data Flow

```text
Public sources + user/project submissions
  -> Evidence records
  -> AI extraction
  -> Project / Opportunity candidates
  -> Deduplication
  -> GitHub/source enrichment
  -> Scoring + risk labels
  -> Review queue
  -> Public leaderboards and pages
  -> Outbound click tracking
  -> Ranking/report feedback loop
```

### Evidence-First Principle

Every public claim should be backed by evidence.

A project, opportunity, score, and risk label should be able to answer:

- Where did this information come from?
- Is the source official or community-submitted?
- When was it last checked?
- Is the reward verified, unclear, or speculative?
- What did AI infer versus what the source explicitly states?

This protects trust and makes OPC aggregation defensible.

### Source Strategy

V1 primary sources:

- GitHub public data
- official project websites
- official docs/blogs
- user-submitted URLs
- project-submitted URLs

V1 secondary sources:

- HN public pages/search
- Reddit public/RSS links
- Hugging Face public pages
- ProductHunt public pages/manual importer

V1 evidence-only sources:

- X submitted links
- WeChat/公众号 submitted links
- Zhihu submitted links
- Bilibili/Xiaohongshu/Jike submitted links
- Discord/Telegram links submitted by projects or users

These evidence-only sources can support context but should not be treated as complete market coverage.

### AI Role

AI should do routine transformation work:

- summarize source pages
- extract project/opportunity fields
- classify opportunity type
- generate tags
- estimate task difficulty
- create risk labels
- explain why an item is ranked
- draft SEO metadata and digest copy
- suggest duplicate matches

AI should not be the final authority for:

- high-risk reward claims
- speculative airdrops
- wallet-required tasks
- sponsored placements
- homepage top positions
- project correction disputes

### Human Review Triggers

Human review is required when:

- reward is high but unclear
- opportunity mentions airdrop/token/wallet
- official source is missing
- AI confidence is low
- duplicate match is ambiguous
- item is sponsored or paid
- item enters homepage top placements
- user reports risk or misinformation

Low-risk GitHub/open-source listings with official links can auto-publish.

## 5. Ranking Logic

V1 rankings should be useful, explainable, and hard to buy.

### Core Score Components

- Opportunity value: reward, free credits, bounty size, early access, learning value
- Credibility: official source, GitHub quality, project clarity, public docs
- Momentum: GitHub velocity, launch freshness, public discussion, internal click growth
- Ease: time required, no-login availability, clear steps, low setup cost
- Freshness: new or recently updated opportunities get a temporary boost
- AI relevance: fit with AI agents, LLMs, MCP, RAG, evals, devtools, models
- User interest: outbound clicks, saves, submissions, reports, with anti-abuse caps
- Risk penalty: unclear rewards, suspicious domains, wallet/private key requests, spam tasks

### Ranking Explanation

Every ranked card should answer:

- Why is this listed?
- Why is it ranked here?
- What signal is strongest?
- What risk should users know?

Example:

> Ranked because the project has an active GitHub repo, a clear official free-credit offer, and the task takes under 5 minutes. Reward is official but availability may change.

### Sponsored Boundary

Sponsored placement can exist only as a labeled module.

Sponsored status must not secretly improve organic ranking.

## 6. UX Principles

### Browse First

Users should be able to browse, filter, open details, and click official links without logging in.

### One-Screen Judgment

A user should understand an opportunity from a card without opening the detail page.

Each card should show:

- project name
- opportunity hook
- reward/upside type
- estimated time
- difficulty
- trust label
- risk label
- why ranked
- CTA

### Trust Is Visible

Trust labels should be visible, not hidden in methodology pages.

Required labels:

- Official Source
- Verified
- Unverified
- AI Summary
- Last Checked
- Reward Not Guaranteed
- Sponsored
- High Risk
- No Login
- Ending Soon

### Outbound Is The Main Action

V1 should route users to official sources.

Primary CTAs:

- Go claim
- View official task
- Open GitHub
- Try agent
- View bounty
- Read source

Secondary CTAs:

- Save
- Submit update
- Report issue
- Subscribe

### Low Cognitive Load

Avoid showing too many scores at once.

Use a simple scorecard:

- Value
- Credibility
- Ease
- Momentum
- Risk

Keep the full scoring methodology on a separate page.

## 7. Page-Level UX

### Homepage

Purpose: help users quickly find today’s best AI opportunities.

Recommended structure:

1. Hero: “Today’s AI opportunities, ranked by value, credibility, and momentum.”
2. Top 10 Today’s AI Opportunities
3. Quick filters: Free Credits, Possible Airdrop, GitHub, Agent Trial, Bounty, No Login, 5 Min, Verified
4. Category leaderboard previews
5. Rising Open-Source AI Projects
6. Trending AI Agents / MCP Tools
7. Submit an opportunity CTA
8. Subscribe CTA

### Category Leaderboard Page

Purpose: let users browse a specific intent.

Must include:

- category explanation
- ranking methodology for this category
- filters
- ranked opportunity cards
- last updated time
- source/risk legend

### Opportunity Detail Page

Purpose: answer whether the user should spend time on this opportunity.

Must answer:

1. What is this?
2. What can I get?
3. What do I need to do?
4. How long will it take?
5. Is it official or unverified?
6. What are the risks?
7. Where do I go next?

Recommended sections:

- summary
- reward/upside
- task steps
- effort estimate
- official/source links
- risk notes
- why ranked
- similar opportunities
- report/update link

### Project Page

Purpose: aggregate all public evidence and opportunities around one AI project.

Must include:

- project summary
- official links
- GitHub metrics if available
- active opportunities
- ranking appearances
- source evidence list
- risk/credibility notes
- similar projects

### Submit Page

Purpose: let users/projects submit with minimal friction.

V1 form should ask only:

- URL
- type: project / opportunity / free credits / GitHub repo / agent / bounty / correction / risk report
- optional note
- optional contact

AI should extract the rest.

### Methodology Page

Purpose: build trust.

Must explain:

- how rankings work
- what AI does
- what humans review
- what labels mean
- what sponsored means
- what V1 does not claim
- how to report an issue

## 8. Primary User Journeys

### Journey 1: Casual Hunter

1. Opens homepage.
2. Clicks “Free Credits” filter.
3. Sees 5-minute verified opportunities.
4. Opens one detail page.
5. Clicks official claim link.
6. Subscribes for weekly updates.

Success condition: no login required before outbound click.

### Journey 2: Builder

1. Opens Open-Source AI Momentum leaderboard.
2. Filters for Agent/MCP/RAG.
3. Opens project page.
4. Reviews GitHub metrics and source links.
5. Opens GitHub repo.
6. Optionally submits a correction or related opportunity.

Success condition: user trusts the ranking because sources and GitHub signals are visible.

### Journey 3: Project Team

1. Finds project listed or opens submit page.
2. Submits official website/GitHub/opportunity URL.
3. AI extracts draft listing.
4. Human/agent review approves it.
5. Project appears in relevant leaderboard.
6. Later project receives ranking notification or report draft.

Success condition: project can get listed without a sales call or integration.

## 9. UX Anti-Patterns To Avoid

- Login wall before browsing
- Too many technical metrics on opportunity cards
- Dark-pattern airdrop promises
- Sponsored cards that look organic
- Long task forms before users understand value
- Unclear source provenance
- Claims like “guaranteed reward” or “guaranteed star”
- Treating AI-generated speculation as verified fact

## 10. V1 Success Definition

V1 succeeds if:

- a new user can find and click a useful opportunity within 30 seconds
- every listing has source provenance and trust/risk labels
- most routine listings are AI-generated and low-risk auto-published
- GitHub and submissions provide enough data to keep rankings fresh
- project teams start submitting official links or asking how to improve their ranking
- the founder is reviewing exceptions, not writing every listing manually
