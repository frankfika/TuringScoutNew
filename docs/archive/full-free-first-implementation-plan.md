# Full Free-First Implementation Plan

## 1. Goal

Build a complete AICookieDao system with maximum free/public data and automation, even if some workflows are technically complex.

The constraint is not “only do simple things”. The constraint is:

> Avoid high recurring cash cost; use engineering, open data, public pages, submissions, caching, and AI automation to build a complete pipeline.

## 2. Product Outcome

AICookieDao should become a continuously updated AI opportunity and adoption intelligence system:

- AI discovers projects/opportunities from free/public sources
- AI extracts structured data
- AI enriches with GitHub and public metrics
- AI scores and ranks opportunities
- AI generates pages, summaries, reports, and outreach
- Users browse leaderboards without login
- Users/projects submit missing signals
- Internal clicks and submissions become owned data
- Later, contribution attribution and rewards are layered on top

## 3. System Architecture

### Modules

1. Source Registry
2. Crawlers / Collectors
3. Raw Evidence Store
4. AI Extraction Pipeline
5. Entity Resolution / Deduplication
6. Metric Enrichment
7. Scoring Engine
8. Risk Engine
9. Publishing Engine
10. Admin Review Console
11. User Submission System
12. Click / Attribution Tracker
13. Digest / Outreach Generator

### Data Flow

```text
Sources
  -> Collectors
  -> Raw Evidence Store
  -> AI Extractor
  -> Project / Opportunity DB
  -> Enrichment Jobs
  -> Scoring Engine
  -> Risk Engine
  -> Admin Review
  -> Public Leaderboards / Pages
  -> Click Tracking / User Feedback
  -> Score Updates / Reports
```

## 4. Free/Public Source Plan

### 4.1 GitHub

GitHub should be the backbone.

#### Data To Collect

- Repo metadata
- Stars
- Forks
- Watchers
- Issues
- Pull requests
- Contributors
- Releases
- Topics
- README
- License
- Last commit
- Language
- Created date
- Updated date

#### Discovery Methods

- GitHub search queries
- Topic pages
- Trending pages if accessible
- Awesome lists
- Dependency/example links from README files
- Search by keywords:
  - AI agent
  - MCP server
  - RAG
  - LLM app
  - coding agent
  - eval framework
  - vector database
  - agent framework
  - browser agent

#### Derived Metrics

- Star velocity
- Fork velocity
- Recent activity score
- Contributor growth
- Release freshness
- Issue health
- Maintainer responsiveness proxy
- Repo credibility score

### 4.2 Hacker News

Use Algolia HN Search API or public pages.

#### Discovery Queries

- AI agent
- open source AI
- LLM tool
- MCP
- RAG
- launched AI
- Show HN AI
- GitHub AI

#### Signals

- Points
- Comments
- Recency
- Discussion quality via AI summary
- Project URLs mentioned

### 4.3 Reddit

Use public RSS/search pages where possible, plus user-submitted links.

#### Subreddits

- r/LocalLLaMA
- r/MachineLearning
- r/OpenAI
- r/ArtificialInteligence
- r/ChatGPTCoding
- r/AI_Agents
- r/selfhosted
- r/SaaS
- r/SideProject
- r/programming

#### Signals

- Post title
- URL
- Upvotes if visible
- Comment count if visible
- Recency
- AI-extracted project mentions
- Sentiment summary

### 4.4 ProductHunt

Use public pages/RSS/manual low-frequency collection.

#### Signals

- Product name
- Tagline
- Website
- Launch date
- Upvotes if visible
- Topics/tags
- Maker links
- Comments summary

### 4.5 Hugging Face

Monitor:

- Trending models
- Trending spaces
- Trending datasets
- Organization pages
- New spaces related to agents/tools

Signals:

- Likes
- Downloads if available
- Last modified
- Tags
- Model/task type
- Demo availability

### 4.6 Project Websites / Blogs / Docs

Use submitted URLs and discovered homepages.

Extract:

- Product description
- Pricing/free tier
- Credits/offers
- Waitlist
- Docs links
- GitHub links
- API docs
- Blog/RSS
- Terms and reward clarity

### 4.7 Newsletters / Blogs / Dev Communities

Use public RSS and user submissions.

Sources can include:

- Dev.to
- Medium public pages
- Substack public posts
- company blogs
- AI newsletters with public archives
- IndieHackers if accessible

### 4.8 X / Twitter

Do not rely on paid API.

Use:

- Submitted X URLs
- Project-submitted launch posts
- Manual curated account list
- Public page previews if accessible
- Embeds/links rather than full ingestion

Signals:

- Exists as official announcement
- Author/project identity
- Date
- Content summary if accessible

### 4.9 Chinese Sources

Use free but practical methods.

#### WeChat Public Account

- User-submitted article URLs
- Project-submitted article URLs
- Manual weekly curation
- AI extraction when text is accessible

#### Zhihu

- Public search/manual collection
- Submitted links
- AI summaries when accessible

#### Bilibili / Xiaohongshu / Jike

- Submitted links
- Manual creator/source list
- Treat as evidence links, not exact ranking metrics in V1

## 5. Raw Evidence Store

Every discovered item should be saved as raw evidence.

Fields:

- id
- source_type
- source_name
- source_url
- discovered_at
- fetched_at
- raw_title
- raw_text_excerpt
- raw_html_snapshot optional
- raw_json optional
- author/source account
- published_at if known
- linked_urls
- language
- fetch_status
- checksum/hash

Reason:

- Avoid re-fetching
- Keep provenance
- Allow AI reprocessing later
- Support fairness and verification
- Reduce hallucination

## 6. AI Extraction Pipeline

For each raw evidence item, AI should extract structured candidates.

### Project Candidate

- name
- slug suggestion
- website_url
- github_url
- huggingface_url
- producthunt_url
- x_url
- discord_url
- category
- tags
- short_description
- target_users
- project_stage
- source_urls

### Opportunity Candidate

- title
- project_name
- opportunity_type
- reward_type
- reward_value_text
- task_steps
- difficulty
- estimated_time
- official_url
- starts_at
- ends_at
- proof_required
- eligibility
- risk_notes
- source_urls

### Content Candidate

- social/content URL
- author
- project mentioned
- content type
- sentiment
- quality estimate
- technical depth estimate
- audience fit

## 7. Deduplication And Entity Resolution

Complex but important.

Use deterministic rules first:

- Same website domain
- Same GitHub URL
- Same Hugging Face org/model
- Same normalized project name
- Same X handle

Then AI-assisted fuzzy matching:

- Similar names
- Similar descriptions
- Shared official links
- Same founder/team
- Same logo/title metadata

Potential statuses:

- new project
- duplicate of existing project
- new opportunity for existing project
- ambiguous, needs review

## 8. Enrichment Jobs

### GitHub Enrichment

For each repo:

- Pull current metrics daily or every few days
- Store metric snapshots
- Calculate deltas

Tables:

- github_repo_metrics_daily
- github_repo_events optional

### Website Enrichment

- Fetch title/description
- Detect pricing/free tier page
- Detect docs page
- Detect API page
- Detect GitHub links
- Detect RSS/blog

### Link Graph Enrichment

Track relationships:

- Project -> GitHub repo
- Project -> opportunities
- Project -> social links
- Project -> content mentions
- Opportunity -> source evidence
- User submission -> project/opportunity

## 9. Scoring Engine

Use hybrid scoring: deterministic formula + AI explanation.

### Base Opportunity Score

```text
Opportunity Score =
  0.20 * Value Score
+ 0.20 * Credibility Score
+ 0.15 * Momentum Score
+ 0.15 * Ease Score
+ 0.10 * Freshness Score
+ 0.10 * User Interest Score
+ 0.10 * AI Relevance Score
- 0.20 * Risk Score
```

Weights can vary by leaderboard.

### Project Momentum Score

```text
Momentum Score =
  GitHub Velocity
+ Public Discussion Signal
+ Product Launch Signal
+ Internal Click Growth
+ Submission Frequency
```

### Adoptionshare Score V1

For early MVP, use proxy metrics:

- Outbound clicks from AICookieDao
- GitHub activity growth after listing
- User saves/completions if available
- Submitted proof links
- Content mentions submitted/discovered
- Project-provided conversion numbers if any

Later:

- Agent sessions
- API calls
- referral conversions
- PR/issue attribution
- verified creator impact

## 10. Risk Engine

Risk score should combine deterministic and AI checks.

### Risk Signals

- No official website
- No official source for reward
- Domain recently unknown/suspicious
- Reward too good to be true
- Requires wallet/private key/seed phrase
- Requires excessive permissions
- Requires spam behavior
- Fake GitHub star request
- No team/project history
- Conflicting reward terms
- Broken links
- User reports

### Risk Labels

- Unverified
- Reward Not Guaranteed
- Sponsored
- Official Source Verified
- High Risk
- Requires Login
- Requires Wallet
- No Clear Reward Terms
- Possible Spam Task

## 11. Publishing Engine

Generate pages from database.

### Leaderboards

- Today’s AI Opportunities
- Free AI Credits
- AI Points / Possible Airdrops
- Open-Source AI Momentum
- AI Agents
- AI Bounties
- MCP Tools
- RAG Tools
- AI DevTools
- Rising Projects
- Newly Discovered

### Page Types

- Project page
- Opportunity page
- Category page
- Weekly archive page
- Methodology page
- Submit page

### AI-Generated Page Elements

- Summary
- Why ranked
- Best for
- Task steps
- Risk note
- Similar opportunities
- SEO title
- SEO description
- Social share text

## 12. Admin Review Console

One-person operation needs a fast queue.

### Queue Views

- New candidates
- Ambiguous duplicates
- High-risk items
- Top ranking changes
- User-submitted items
- Sponsored submissions
- Broken/outdated links

### Actions

- Approve
- Reject
- Merge
- Edit fields
- Mark verified
- Mark sponsored
- Add risk label
- Re-run AI extraction
- Re-score
- Archive

### Review Priority

Only require human review for:

- Homepage top 20
- Sponsored items
- High-risk items
- Unclear reward items
- User-reported items
- Potential scam/wallet tasks

Low-risk GitHub/open-source listings can auto-publish with an auto-discovered label.

## 13. User Submission System

### No-Login Submission

Fields:

- URL
- Type optional
- Comment optional
- Contact optional

AI fills the rest.

### Submission Types

- New AI project
- Free credit
- Points/airdrop
- GitHub repo
- Agent trial
- Bounty/grant
- Content/social proof
- Risk report
- Correction/update

### Incentive

Later, users can claim credit for useful submissions.

For V1:

- Show “submitted by community” if user wants
- Give optional contributor name/link
- Later convert into points/reputation

## 14. Click And Attribution Tracking

Because external APIs are expensive, internal click data becomes crucial.

Track:

- Page view
- Outbound click
- CTA clicked
- Source/referrer
- Anonymous visitor ID
- Opportunity ID
- Project ID
- Timestamp
- UTM generated

Use:

- Ranking signal
- Project reports
- Paid campaign proof
- User interest score
- Trend detection

## 15. Content Automation

### Daily Digest

AI generates:

- Top 5 new opportunities
- Top free credit
- Top open-source mover
- Top agent trial
- Risky/unverified watchlist

### Weekly Report

AI generates:

- Fastest-growing AI projects
- Best opportunities this week
- New AI agent projects
- Best bounties
- Category trends

### Project Notification

AI generates:

- “You ranked #X this week” message
- Short performance stats
- Suggested improvement/campaign angle
- Paid featured listing CTA

## 16. Free-First But Complete Roadmap

### Phase 0: Data Schema And Manual Seed

- Define project/opportunity/evidence/schema
- Manually seed 50-100 items
- Add source URLs
- Add basic leaderboard

### Phase 1: GitHub + Submission Backbone

- GitHub enrichment
- URL submission
- AI extraction from submitted URLs
- Admin review queue
- Outbound click tracking

### Phase 2: Public Source Collectors

- HN collector
- Reddit RSS/search collector
- ProductHunt collector/manual importer
- Hugging Face collector
- RSS/blog collector
- Awesome-list collector

### Phase 3: AI Scoring And Auto-Publishing

- AI tags
- AI summaries
- AI risk labels
- AI ranking explanations
- Scheduled leaderboard regeneration
- Weekly archive generation

### Phase 4: Contribution And Adoptionshare V1

- Optional user identity
- Save/complete/submit proof
- Track submitted content links
- Attribute clicks to submitters/creators
- Build early user/project scorecards

### Phase 5: Project Monetization

- Project claim page
- Featured placement
- Sponsored label
- Project report
- Campaign package

## 17. Engineering Complexity Worth Doing For Free

These are complex but valuable and avoid high cash costs:

- Entity deduplication
- GitHub metric snapshots
- AI extraction cache
- Admin review queue
- Internal click tracking
- Source evidence store
- Static SEO page generation
- AI weekly digest
- Submission-to-listing automation

These are complex and should wait:

- Full X crawling
- Full WeChat crawling
- Wallet/token system
- Reward escrow
- Real-time social listening
- Enterprise-grade attribution
- Multi-platform creator identity graph

## 18. Success Criteria

The system works if one person can:

- Maintain 100-500 active opportunities
- Approve daily updates in under 30 minutes
- Publish weekly reports automatically
- Generate project outreach from rankings
- Show useful leaderboards without paid APIs
- Start selling featured/report products after traffic appears

## 19. Key Tradeoff

We accept incomplete coverage in exchange for:

- Low cost
- Fast launch
- Trustworthy source links
- Compounding internal data
- AI-assisted scale
- One-person operability

The moat is not “we bought every API”.

The moat is:

> We continuously convert messy public AI opportunity signals into structured, ranked, explainable, and actionable adoption intelligence.


## 20. Version Mapping

### V1 Must Build

- Source registry for GitHub, submissions, public websites, and selected public sources
- Raw evidence store
- AI extraction from submitted/public URLs
- Project and opportunity records
- Deterministic + AI-assisted deduplication
- GitHub enrichment and metric snapshots
- Score snapshots and ranking explanations
- Risk labels and review queue
- Public leaderboard/project/opportunity pages
- Outbound click tracking
- No-login submission flow

### V1.5 Should Build

- Weekly archive generation
- Digest/report draft generation
- OpenClaw/agent scheduled jobs
- Project ranking notification drafts
- Cleanup/expiry detection
- Shareable ranking cards

### V2 Should Build

- Optional user identity
- Saved/completed tasks
- Proof link submission
- Contributor profiles
- Project claim flow
- Conservative Adoptionshare reports

### V3 Or Later

- Paid campaign workflow
- Reward approval
- Contribution leaderboards
- Creator/builder campaign packages
- Project dashboards and API products
- Points/access layer
- Token optionality

### Explicit V1 Deferrals

- Full X API or firehose
- Full WeChat/Zhihu/social crawling
- Wallet/token system
- Reward escrow
- Exact global mindshare
- Complex creator identity graph
- Automated payout system
