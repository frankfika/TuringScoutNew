# 07 Social Influence Mechanism

Canonical status: current source of truth for TuringScout social mechanism.


## One-Sentence Mechanism

TuringScout is not just a ranking board for AI projects.

> It is a public reputation loop where useful AI opportunities get ranked, the people who discover and explain them get credited, projects see who helped them get attention, and that visible feedback makes more scouts, creators, and projects participate.

Chinese version:

> TuringScout = AI 机会榜 + AI Scout 影响力榜。项目被看见，创作者也被看见；贡献被记录，未来才可能被项目邀请、合作或奖励。

The social loop only works if it sits on top of a durable evidence layer:

- Raw evidence proves where an opportunity or creator contribution came from.
- Public credit makes contribution visible and shareable.
- Score history turns repeated useful contribution into reputation.
- Project acknowledgements convert social attention into business relationships.
- Reports and campaigns monetize the accumulated adoption graph later.


## The Core Loop

```text
1. Project has an opportunity
   free credits / agent demo / GitHub repo / bounty / early access / MCP tool

2. System or scout discovers it
   automated source registry finds it, or a scout optionally submits official URL, GitHub link, docs, source, or risk correction

3. Creator explains it
   writes a post, video, tutorial, benchmark, comparison, or thread

4. TuringScout verifies and ranks it
   source, value, effort, risk, momentum, and usefulness are scored

5. Public credit is shown
   Spotted by / Explained by / Validated by / Top Voice

6. Creator shares the ranking card
   because the card gives them status and proof of being early

7. Project notices the creator
   reposts, corrects listing, optionally submits official info, or later starts a campaign

8. Users click official links
   project gets real traffic; TuringScout learns which opportunities convert

9. Reputation accumulates
   good scouts and creators earn profile history, leaderboard status, and future campaign eligibility
```

The product should make this loop obvious on every important surface.


## Why People Participate

### Users / Hunters

Motivation:

- save time
- find useful AI opportunities early
- avoid scams, stale links, and noisy hype

Reward:

- fast discovery
- clear source/risk/effort labels
- official action links

### AI Scouts

Motivation:

- be early
- get recognized for finding useful opportunities
- build public reputation before everyone else talks about the project

Reward:

- `Spotted by` credit
- weekly scout recognition
- later scout profile and contribution history

### Creators / Influencers / KOLs

Motivation:

- find content topics
- get distribution
- be seen by projects
- prove they can drive useful attention, not just generic traffic

Reward:

- `Explained by` / `Validated by` credit
- link placement on project/opportunity pages
- share cards
- Top Voices recognition
- future project campaign eligibility

### Projects / DevRel

Motivation:

- get real users and builders
- see which creators are helping them
- correct inaccurate listings
- recruit useful creators for future launches or campaigns

Reward:

- official listing
- source-backed ranking
- creator coverage summary
- qualified outbound traffic
- later campaign/report products


## Three Interlocked Leaderboards

TuringScout should not have only one leaderboard.

### 1. Opportunity Leaderboard

Question answered:

> Which AI opportunities are worth trying today?

Ranked by:

- value/upside
- credibility
- freshness
- momentum
- effort/ease
- AI relevance
- capped user interest
- capped social proof
- risk penalty

Primary user:

- hunters, builders, AI users

### 2. Project Leaderboard

Question answered:

> Which AI projects are gaining useful adoption attention?

Ranked by:

- opportunity quality
- official source quality
- GitHub/product momentum
- useful creator coverage
- user clicks
- project responsiveness
- risk/trust history

Primary user:

- projects, creators, builders, investors, DevRel teams

### 3. Scout / Top Voices Leaderboard

Question answered:

> Who is discovering, explaining, validating, and spreading useful AI opportunities?

Ranked by:

- quality of discoveries
- usefulness of explanations
- evidence quality
- project relevance
- project acknowledgements
- user engagement quality
- consistency
- anti-spam penalties

Primary user:

- scouts, creators, KOLs, projects


## Contribution Types

Each contribution should have a clear type so the product rewards the right behavior.

| Type | What It Means | Example | Public Credit |
| --- | --- | --- | --- |
| Discovery | Found a useful opportunity early | submitted official free-credit page | Spotted by |
| Explanation | Made the opportunity understandable | thread/video explaining use case | Explained by |
| Validation | Tried it and showed evidence | demo, screenshot, test result | Validated by |
| Tutorial | Helped others use it | setup guide, workflow, code sample | Tutorial by |
| Benchmark | Compared quality/performance | repo/model/tool comparison | Benchmarked by |
| Builder proof | Contributed to adoption | issue, PR, MCP server, integration | Built by |
| Risk report | Improved trust | expired offer, fake reward, suspicious link | Risk flagged by |
| Correction | Improved accuracy | official docs, updated eligibility | Corrected by |

This is important: TuringScout should not reward only loud posting. It should reward useful contribution to discovery, trust, understanding, and adoption.


## Public Page Mechanics

### Opportunity Card

Each card can show:

```text
Project: ExampleAI
Opportunity: Claim free API credits for testing an agent SDK
Trust: Official Source
Risk: Reward Not Guaranteed
Why ranked: clear official offer + active GitHub + low effort
Spotted by: @alice
Useful context: 2 creator posts, 1 tutorial
CTA: Go claim
```

Purpose:

- user sees why to click
- scout/creator gets visible credit
- project sees who helped distribution

### Opportunity Detail Page

Recommended social module:

```text
Official sources
- Website
- Docs
- GitHub

Scout credits
- @alice spotted the official free-credit page

Useful creator context
- @bob: 5-minute demo video
- @chen: Chinese setup tutorial
- @devx: benchmark thread

Project acknowledgement
- Project reposted @bob's demo on 2026-05-01
```

Rules:

- official sources appear above creator/social proof
- creator content is clearly labeled as creator content
- paid creator content must be labeled
- risky reward claims require review

### Project Page

Each project page should show:

- official links
- active opportunities
- ranking history
- top scouts
- top voices
- useful tutorials/demos/benchmarks
- project acknowledgements
- corrections and risk history

This turns the project page into a mini adoption graph, not just a static directory page.

### Creator / Scout Profile Later

V2 profile should show:

- discoveries
- explanations
- validations
- tutorials/benchmarks
- project acknowledgements
- categories where the person is strong
- contribution quality history
- campaign eligibility later


## Scoring Mechanics

### Opportunity Score

Opportunity score should remain mostly source/trust/value based. Social proof helps, but cannot dominate.

```text
opportunity_score =
  0.25 * opportunity_value
+ 0.20 * source_credibility
+ 0.15 * project_momentum
+ 0.12 * freshness
+ 0.10 * ease_of_action
+ 0.08 * AI_relevance
+ 0.05 * capped_user_interest
+ 0.05 * capped_social_proof
- risk_penalty
```

Why social proof is capped:

- creators can be loud but wrong
- projects can coordinate hype
- users need source-backed trust first
- official evidence should beat popularity

### Creator / Scout Score

Creator score should measure useful contribution, not raw followers.

```text
creator_score =
  0.25 * discovery_quality
+ 0.20 * explanation_quality
+ 0.15 * evidence_quality
+ 0.15 * adoption_relevance
+ 0.10 * project_acknowledgement
+ 0.10 * engagement_quality
+ 0.05 * consistency
- spam_penalty
- undisclosed_sponsor_penalty
- unsupported_claim_penalty
```

Definitions:

- Discovery quality: was the opportunity real, early, useful, and source-backed?
- Explanation quality: did the content help users understand what to do and why it matters?
- Evidence quality: did it include official links, docs, GitHub, demos, screenshots, or reproducible steps?
- Adoption relevance: did it help users try, build, integrate, claim, or evaluate?
- Project acknowledgement: did the official project reply, repost, correct, or validate?
- Engagement quality: did it produce meaningful comments and discussion, not only likes?
- Consistency: does the person repeatedly submit useful signal without spamming?

### Project Social Momentum

Projects should have a separate social momentum layer:

```text
project_social_momentum =
  useful_creator_count
+ scout_discovery_count
+ tutorial_or_benchmark_count
+ project_acknowledgement_count
+ qualified_outbound_clicks
- dispute_or_risk_reports
```

This helps TuringScout later sell project reports:

> Here are the people and content driving useful attention to your project.


## V1 Product Features

### Build Now

- optional correction/credit form with social handle
- optional creator/content URL
- `Spotted by` credit on listings
- `Useful creator context` module on detail pages
- share card for ranked opportunities
- weekly manually curated `Top AI Scouts / Top Voices`
- admin fields for creator quality and spam risk
- project outreach mentioning useful creators

### Build Next

- creator/scout profile
- category-specific Top Voices
- creator notification emails/DM drafts
- project dashboard showing useful creators
- project acknowledgement tracking
- creator contribution history

### Do Not Build Yet

- wallet/token rewards
- automatic payouts
- raw social follower ranking
- full X/WeChat/Zhihu crawling
- paid campaign marketplace
- unreviewed reward/airdrop campaigns


## Anti-Abuse Mechanics

The same mechanism that creates growth can also create spam. Build guardrails early.

Penalize:

- repeated copy-paste posts
- low-effort AI-generated threads
- fake engagement groups
- unsupported reward or airdrop claims
- undisclosed paid promotion
- irrelevant posts that only tag trending projects
- volume farming across too many projects
- project/team accounts pretending to be independent creators

Reward:

- original explanation
- real use or testing
- tutorials and demos
- benchmarks and comparisons
- official source links
- thoughtful community discussion
- project acknowledgement
- useful risk reports and corrections


## V1 Manual Workflow

The first version can be semi-manual.

Daily:

1. Review new source-registry candidates and raw evidence.
2. Review optional opportunity submissions and creator/social proof links.
3. Approve only useful credits.
4. Generate top opportunity cards.
5. Send/share cards to credited scouts and creators.
6. Notify projects when useful creator coverage appears.

Weekly:

1. Publish Top AI Opportunities.
2. Publish Top AI Scouts / Top Voices.
3. Send creators their recognition card.
4. Send projects a short coverage summary.
5. Ask projects to optionally submit official corrections or opportunities.

This is enough to test the human loop before building complex automation.


## What Success Looks Like

### User Signal

- users click official links
- users say listings save time
- users use creator context to decide whether to try

### Creator Signal

- creators explain/share/correct voluntarily, and sometimes submit content links
- creators ask to be credited
- creators repost ranking cards
- creators return with new discoveries

### Project Signal

- projects repost ranking cards
- projects correct listings
- projects ask who drove attention
- projects ask about launch/campaign packages

### Platform Signal

- opportunities improve because creators and projects add better evidence
- rankings become more trusted over time
- social distribution happens without paid ads


## Reference Pattern From The Source Inspiration

The reference pattern observed from public docs is:

- track project attention and sentiment
- surface top voices shaping the narrative
- give each project a dashboard of posts and momentum
- let projects run campaigns around creator attention
- reward quality/originality/relevance more than noise
- penalize farming, copied content, low-quality AI text, fake engagement, and irrelevant posting

TuringScout should adapt the pattern to AI adoption:

- replace token attention with AI opportunity/adoption attention
- replace X-only posting with multi-platform evidence and creator content
- replace wallet-first rewards with public credit first
- replace speculation with source-backed opportunity value
- replace raw mindshare with discovery, explanation, validation, and adoption usefulness


## Sources

- Reference docs, cookie.fun: https://docs.cookie.community/cookie-dao/cookie.fun
- Reference docs, Snaps overview: https://docs.cookie.community/cookie-dao/cookie.fun/cookie-snaps/what-is-cookie-snaps
- Reference docs, Snaps participation: https://docs.cookie.community/cookie-dao/cookie.fun/cookie-snaps/how-to-participate-in-snaps
- Reference docs, content guide: https://docs.cookie.community/cookie-dao/cookie.fun/cookie-snaps/content-guides/how-to-create-valuable-content
- Reference docs, farming policy: https://docs.cookie.community/cookie-dao/cookie.fun/cookie-snaps/farming-policy
