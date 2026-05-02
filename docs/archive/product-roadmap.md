# Product Roadmap

## Roadmap Logic

AICookieDao should not try to become a full CookieDAO-style reward network on day one.

The correct sequence is:

1. **OPC leaderboard engine**: aggregate public AI project signals and turn them into useful rankings.
2. **AI automation layer**: reduce founder workload through extraction, scoring, publishing, cleanup, and outreach agents.
3. **Adoptionshare attribution**: measure who drives useful AI project attention, usage, contribution, and adoption.
4. **Campaign network**: let projects buy verified adoption campaigns without buying fake stars or spam.
5. **Data/API intelligence**: monetize the structured adoption data layer.
6. **Points/access optionality**: add off-chain points and access rights only after the data and campaign loops work.

## Version Overview

| Version | Core Goal | Primary Customer | Primary Output |
| --- | --- | --- | --- |
| V0 | Align strategy and documentation | Founder / builders | Clear implementation roadmap |
| V1 | Build GitHub + submission-driven AI OPC leaderboards | Users / projects | Public rankings and outbound traffic |
| V1.5 | Automate operation and distribution | Founder | Low-touch daily operations |
| V2 | Add lightweight Adoptionshare attribution | Users / projects | Contribution profiles and reports |
| V3 | Launch project campaigns and rewards | AI project teams | Paid adoption campaigns |
| V4 | Productize data and intelligence | Projects / VCs / DevRel | Dashboards, reports, APIs |
| V5 | Add points/access layer | Power users / partners | Reputation, access, reward eligibility |

## V0: Strategy Consolidation

### Goal

Turn the current strategy into one implementation-ready narrative.

### Key Decisions

- AICookieDao is an OPC platform first, not a heavy bounty marketplace.
- V1 is **GitHub + URL submission driven**.
- The public leaderboard is the traffic surface; evidence, scoring, and attribution are the moat.
- Automation should handle routine work; humans handle risk, quality, and monetization.
- CookieDAO-like campaign/reward mechanics belong in V3, not V1.

### Deliverables

- Unified product roadmap
- Clear version boundaries
- V1 non-goals
- Updated README and one-page PRD

### Exit Criteria

- A teammate can tell which features belong to V1, V2, or V3 without guessing.
- Documentation no longer implies that all collectors, rewards, and attribution must be built at once.

## V1: GitHub + Submission AI OPC Leaderboard

### Goal

Launch a public, low-cost, AI-automated leaderboard that helps users discover AI projects and opportunities without login.

### User Value

- Discover AI projects worth trying, starring, testing, or claiming credits from.
- Browse ranked AI opportunities without creating an account.
- See source links, risk labels, and AI-generated ranking explanations.
- Make a decision from one card: reward/upside, effort, trust, risk, and official CTA.

### Project Value

- Receive free/organic discovery through rankings.
- Submit official project and opportunity links.
- Get early traffic and visibility without complex campaign setup.

### Core Features

- Homepage: Today’s AI Opportunities
- Category leaderboards:
  - Open-source AI Momentum
  - AI Agents
  - MCP Tools
  - RAG Tools
  - AI DevTools
  - Free AI Credits
  - AI Points / Possible Airdrops
  - AI Bounties
- Project pages with source links and GitHub data
- Opportunity pages with reward/task/risk summaries
- No-login project/opportunity submission form
- Outbound click tracking
- Basic admin review queue
- Methodology page explaining scoring and fairness

### Data Sources

Primary:

- GitHub public data
- User-submitted URLs
- Project-submitted URLs
- Public project websites/docs/blogs

Secondary:

- HN search/public pages
- Reddit public/RSS links
- Hugging Face public pages
- ProductHunt public pages/manual importer

Evidence-only in V1:

- X/Twitter submitted links
- WeChat/公众号 submitted links
- Zhihu submitted links
- Bilibili/Xiaohongshu/Jike submitted links
- Discord/Telegram announcements submitted by projects/users

### Product / Tech / UX Logic

- Primary V1 user is the opportunity hunter; project teams and builders are secondary users.
- Product surface is a fast opportunity leaderboard, not a task marketplace.
- Technical architecture is evidence-first: every summary, score, and risk label should trace back to source links.
- UX should be browse-first, trust-labeled, and one-click outbound.
- Documentation stays business-prototype level for V1; detailed APIs and schemas can be added when implementation starts.

### Automation

- URL-to-evidence ingestion
- AI extraction into project/opportunity candidates
- Deterministic + AI-assisted deduplication
- GitHub metric enrichment and snapshots
- AI-generated summaries, tags, risk labels, and ranking explanations
- Low-risk auto-publishing
- Human review for high-risk, sponsored, homepage top slots, and ambiguous duplicates

### Data Model Must-Haves

V1 must include these concepts from the start:

- `Source`: where evidence came from
- `Evidence`: raw/source-backed discovery record
- `Project`: canonical AI project profile
- `Opportunity`: reward/task/launch opportunity tied to a project
- `GithubMetricSnapshot`: time-series GitHub metrics
- `ScoreSnapshot`: ranking score and explanation over time
- `ReviewQueueItem`: items needing human review
- `OutboundClick`: internal click/interest signal
- `Submission`: user/project submitted URL or correction

### Ranking Rules

V1 score should prioritize:

- GitHub momentum
- Official source confidence
- Opportunity value
- Freshness
- AI relevance
- Internal user interest
- Risk penalty

All user-interest signals must be capped and abuse-aware. Submission frequency and clicks cannot dominate rankings.

### V1 Non-Goals

- No full X API dependency
- No full WeChat/Zhihu crawling
- No wallet or token
- No reward escrow or payout system
- No guaranteed GitHub stars
- No exact global mindshare claim
- No complex creator payout system
- No heavy user profile/social graph

### Success Metrics

- 100-300 valid projects/opportunities indexed
- 60%+ low-risk listings auto-publish
- Daily human review queue stays under 20 items
- Users generate meaningful outbound clicks
- Projects start submitting their own links
- Weekly leaderboard can be published consistently

### Exit Criteria To V1.5

- The system can keep leaderboards fresh without manual writing for every listing.
- GitHub + submission workflow is stable.
- There is enough traffic or project interest to justify more automation and distribution.

## V1.5: Automation And Distribution Layer

### Goal

Reduce founder workload and make rankings naturally spread.

### User Value

- Receive fresh opportunities through weekly/daily digest channels.
- Share rankings and project cards easily.

### Project Value

- Get notified when ranked or trending.
- Understand basic traffic and ranking movement.

### Core Features

- Weekly leaderboard archive pages
- AI-generated weekly report drafts
- Telegram/newsletter digest drafts
- Shareable ranking cards/badges
- “You ranked this week” project notification drafts
- Broken/expired link detector
- Cleanup queue
- Founder dashboard for daily review

### Automation

Use OpenClaw or equivalent cron/script/queue agents for:

- Discovery jobs
- GitHub metric jobs
- Extraction jobs
- Scoring/risk jobs
- Publishing jobs
- Digest generation
- Outreach draft generation
- Cleanup jobs

### Success Metrics

- Weekly report is 80% AI-generated
- Daily routine operation takes 10-20 minutes
- Outreach drafts need only light editing
- Expired/broken opportunities are detected automatically
- More projects submit corrections or official links

### Exit Criteria To V2

- Internal click and submission data are reliable enough to become early attribution signals.
- There are repeat users or projects asking for reports, profiles, or proof of contribution.

## V2: Lightweight Adoptionshare Attribution

### Goal

Move from “ranking AI opportunities” to “measuring who helps AI projects get adopted”.

### User Value

- Save opportunities.
- Mark tasks complete.
- Submit proof links.
- Build a lightweight hunter/builder profile.
- Get recognized for useful discoveries and contributions.

### Project Value

- See who discovered, clicked, tested, wrote about, or contributed to the project.
- Receive conservative adoption reports based on evidence.

### Core Features

- Optional login via GitHub/email first; X login is optional and not required
- Saved opportunities
- Completed/attempted status
- Proof link submission
- Contributor profile
- Project claim flow
- Basic project report
- Adoptionshare V1 score

### Adoptionshare V1 Signals

Allowed signals:

- AICookieDao outbound clicks
- User-submitted proof links
- Content links submitted/discovered
- GitHub activity correlation after listing
- Project-provided conversion numbers when available
- User saves/completions

Important wording:

- Use “correlated lift” unless attribution is directly proven.
- Do not claim AICookieDao caused GitHub growth without referral/proof evidence.

### Automation

- AI reviews submitted proof links for relevance
- AI classifies contribution type: discovery, content, GitHub, feedback, integration, usage proof
- AI drafts project reports
- Risk agent flags suspicious proof, self-spam, fake-star requests, and duplicated submissions

### Success Metrics

- Users submit useful proof/content links
- Projects claim profiles or request reports
- First repeat contributors appear
- Adoptionshare score creates better rankings than click-only metrics

### Exit Criteria To V3

- At least several projects want to pay for targeted adoption tasks or reports.
- The platform can distinguish low-quality clicks from useful contributions.
- There is enough trust to distribute rewards manually or semi-manually.

## V3: Campaign And Reward Network

### Goal

Launch CookieDAO-inspired campaigns for AI adoption without becoming a spam or fake-star marketplace.

### User Value

- Earn cash, credits, access, points, or reputation for useful AI project contributions.
- Compete on contribution quality, not bot activity.

### Project Value

- Buy real AI adoption: developer trials, agent usage, integrations, tutorials, feedback, and qualified referrals.
- Get campaign reports and ranked contributor output.

### Campaign Types

- Mindshare Campaign: high-quality content and discussion
- Buildshare Campaign: issues, PRs, docs, templates, MCP integrations, examples
- Usageshare Campaign: API trial, agent session, workflow completion, demo usage
- Creatorshare Campaign: tutorial, benchmark, comparison, video, article
- Referralshare Campaign: qualified developers, teams, creators, hackathon participants

### Core Features

- Project campaign page
- Campaign task templates
- Contribution leaderboard
- Manual/semi-automated reward approval
- Campaign report
- Sponsored placement with clear labels
- Contributor reputation updates

### Commercialization

- Featured launch
- Sponsored slot
- Newsletter sponsorship
- Developer adoption sprint
- Creator/builder campaign package
- Campaign analytics report

### Guardrails

- Organic ranking cannot be bought
- Sponsored placements must be labeled
- Verified badge cannot be bought
- No guaranteed GitHub stars
- No fake reviews
- No spam posting tasks
- High-value rewards require human review

### Success Metrics

- 3-5 paid campaign pilots
- At least 1 repeat-paying project
- Campaigns produce useful public artifacts: tutorials, issues, integrations, feedback, reports
- Projects can see better ROI than generic influencer spend

### Exit Criteria To V4

- Campaign and attribution data become valuable enough to sell as intelligence.
- Multiple projects ask for competitive benchmarks or API/report access.

## V4: Data / API / Intelligence Layer

### Goal

Productize the adoption intelligence data moat.

### User Value

- Better project discovery and trend understanding.
- More accurate rankings based on richer historical data.

### Project / Business Value

- Understand category momentum, competitor growth, creator impact, adoption channels, and campaign ROI.

### Core Features

- Project dashboard
- Category trend reports
- Competitor comparison
- Growth anomaly detection
- Creator/builder impact reports
- API access for AI project and opportunity data
- VC/DevRel intelligence reports

### Customers

- AI project teams
- DevRel teams
- AI infra companies
- VCs and analysts
- Media/newsletters
- Agent marketplaces
- Open-source due diligence teams

### Commercialization

- Paid dashboards
- Private reports
- API subscriptions
- Category sponsorships
- Enterprise/advisor packages

### Success Metrics

- Projects pay for reports or dashboards independent of campaign spend
- Data/API has repeat usage
- Rankings become cited by creators, projects, or analysts
- Internal data improves campaign targeting

### Exit Criteria To V5

- There is a stable contributor/project ecosystem.
- Users care about status and access.
- Projects are willing to allocate rewards or early access based on platform reputation.

## V5: Points / Access / Token Optionality

### Goal

Add a lightweight value-capture and retention layer after the network works.

### User Value

- Earn points for useful discoveries and verified contributions.
- Unlock private alpha feeds, early campaigns, partner rewards, and higher reputation tiers.

### Project Value

- Target high-quality hunters, builders, creators, and early adopters.
- Allocate rewards to users with credible contribution history.

### Core Features

- Cookie Points / Crumbs
- Reputation tiers
- Private alpha feed
- Partner reward eligibility
- Contributor badges
- Early access allocation
- Optional future token design only if justified

### Guardrails

- Do not launch token before clear utility exists.
- Points must not reward spam, bot clicks, or fake stars.
- Points should be tied to verified useful contribution and risk-adjusted quality.
- Any token path requires legal, compliance, and abuse review.

### Success Metrics

- Points improve retention and contribution quality
- Projects use tiers/points to target campaigns
- Users care about access and reputation beyond immediate rewards
- Abuse remains manageable

## Cross-Version Principles

- **Automation first for operations**: collection, extraction, scoring, publishing, cleanup, and reporting should be automated as early as possible.
- **Conservative attribution**: reward attribution should only become stronger when evidence supports it.
- **Fair rankings**: organic rankings cannot be bought.
- **OPC compliance**: always link to original sources, avoid copying full content, and label AI summaries.
- **Founder workload cap**: routine operations should stay under 30 minutes/day.
- **Low recurring cost**: avoid expensive APIs until revenue justifies them.
- **GitHub as backbone**: structured open-source data remains the V1 data foundation.
