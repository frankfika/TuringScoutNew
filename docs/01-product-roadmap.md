# 01 Product Roadmap

Canonical status: current source of truth for version boundaries and sequencing.


## Roadmap Logic

TuringScout should grow in phases:

1. Public opportunity leaderboard surface
2. Evidence/data layer
3. AI automation and agent ops layer
4. Social influence/status loop
5. Adoptionshare attribution layer
6. Campaign and incentive network
7. Data/API intelligence layer
8. Points/access optionality

Strategic rule:

> The leaderboard is the surface. The data layer is the moat. Social status is the growth engine. Adoptionshare and project intelligence are the business model.

## Version Overview

| Version | Goal | Output |
| --- | --- | --- |
| V0 | Align strategy and docs | Clear canonical docs |
| V1 | Automated public-source AI OPC leaderboards | Public rankings, outbound traffic, and optional scout/creator credit |
| V1.5 | Automate ops and distribution | Low-touch daily operation and share loops |
| V2 | Lightweight Adoptionshare attribution | Creator/scout profiles, proof links, reports |
| V3 | Campaign and reward network | Paid adoption campaigns |
| V4 | Data/API intelligence | Dashboards, reports, APIs |
| V5 | Points/access layer | Reputation, access, reward eligibility |

## V0: Strategy Consolidation

Goal: create a clear source of truth.

Deliverables:

- canonical docs
- V1 boundaries
- V2/V3 separation
- archive of earlier brainstorming

Exit criteria:

- a teammate can tell what belongs in V1 without guessing

## V1: Automated Public-Source AI OPC Leaderboard

Goal: launch a public, low-cost, automation-first leaderboard that helps users discover AI opportunities without login and without requiring the community to submit links.

Core features:

- homepage opportunity leaderboard
- category leaderboards
- project pages
- opportunity pages
- optional no-login URL submission/correction
- evidence/source display
- "spotted by" / contributor credit on listings
- social proof links from creators, scouts, and community posts
- shareable ranking cards for projects and creators
- GitHub metric enrichment
- AI summaries, tags, risk labels, ranking explanations
- review queue for risky/high-value/sponsored/top-placement items
- outbound click tracking

Primary data sources:

- automated source registry
- GitHub public data
- official project websites/docs/blogs
- Hugging Face public pages
- HN public search/pages
- ProductHunt public pages/manual importer

Supplemental data sources:

- user-submitted URLs
- project-submitted URLs
- scout/creator-submitted social proof

Secondary data sources:

- Reddit public/RSS links
- Dev.to / public blogs / newsletters with public archives
- arXiv / Papers with Code for research-to-product signals

Evidence-only sources:

- submitted X links
- submitted WeChat/Zhihu/Bilibili/Xiaohongshu/Jike links
- submitted Discord/Telegram announcements

V1 non-goals:

- full X API monitoring
- full WeChat/Zhihu/social crawling
- wallet/token/reward escrow
- guaranteed GitHub stars
- exact global mindshare
- complex user reputation graph

Success metrics:

- 100-300 valid projects/opportunities indexed
- raw evidence is stored for every published listing
- 60%+ low-risk listings auto-publish
- daily human review queue under 20 items
- weekly leaderboard ships consistently
- projects optionally submit official links/corrections
- creators/scouts optionally submit or share useful social proof links
- projects or creators share ranking cards
- meaningful outbound clicks to official links

## V1.5: Automation And Distribution

Goal: reduce founder workload and make rankings spread through projects, scouts, and creators.

Features:

- queue-based agent workflow: discovery, extraction, dedupe, enrichment, risk, publishing, outreach, report, cleanup
- weekly archive pages
- AI-generated weekly report drafts
- Telegram/newsletter digest drafts
- ranking share cards
- weekly AI Scouts / Top Voices recognition
- creator-ready content prompts and project briefing cards
- project “you ranked this week” notification drafts
- creator “you helped surface this” notification drafts
- expired/broken link cleanup
- founder dashboard

Success metrics:

- weekly report is 80% AI-generated
- routine operation takes 10-20 minutes/day
- outreach drafts need only light editing
- projects submit corrections or official links
- creators repost, quote, or explain ranked opportunities
- project teams acknowledge or repost creator coverage

## V2: Lightweight Adoptionshare Attribution

Goal: measure who helps AI projects get discovered, understood, tried, and adopted.

Features:

- optional login via GitHub/email
- saved opportunities
- completed/attempted status
- proof link submission
- creator/scout profile
- Top Voices / AI Scouts leaderboard
- content evidence pages
- project claim flow
- basic project report
- Adoptionshare V1 score

Allowed signals:

- outbound clicks
- submitted proof links
- submitted/discovered content links
- creator posts, videos, tutorials, threads, reviews, and benchmarks
- project acknowledgements/reposts where available
- GitHub activity correlation
- project-provided conversion data
- saves/completions

Rule:

- use “correlated lift” unless direct evidence proves attribution

## V3: Campaign And Reward Network

Goal: let projects pay for real adoption campaigns without fake stars or spam.

Campaign types:

- Mindshare: useful content and discussion
- Buildshare: issues, PRs, docs, examples, MCP integrations
- Usageshare: API trials, agent sessions, workflow completions
- Creatorshare: tutorials, benchmarks, comparisons, videos
- Referralshare: qualified developers, teams, creators, hackathon participants

Guardrails:

- organic rankings cannot be bought
- sponsored placements must be labeled
- verified badge cannot be bought
- no guaranteed GitHub stars
- no fake reviews or spam posting tasks

## V4: Data/API Intelligence

Goal: productize the adoption intelligence layer.

Products:

- project dashboard
- category trend reports
- competitor comparison
- growth anomaly detection
- creator/builder impact reports
- campaign attribution report
- adoption intelligence API
- agent-readable project/opportunity data API
- VC/DevRel intelligence reports

Customers:

- AI project teams
- DevRel and growth teams
- creator/influencer teams
- investors and analysts
- AI agents/apps that need structured project intelligence

## V5: Points / Access / Token Optionality

Goal: add retention and access rights after the data/campaign network works.

Features:

- Scout Points / Signal Points
- reputation tiers
- private alpha feed
- partner reward eligibility
- contributor badges
- early access allocation

Rule:

- do not launch a token until utility, compliance, and anti-abuse controls are proven
