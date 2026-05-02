# MVP Spec

## 1. MVP Goal

Launch a lightweight, leaderboard-first, AI-automated public website that helps users discover AI reward opportunities and helps AI projects get exposure and real usage.

The MVP should prove:

- Users return to browse AI opportunities
- Users click out to project tasks
- Projects want to be listed or featured
- Some projects are willing to pay for placement, curation, or campaign support

## 2. MVP Scope

### Public Pages

#### Home / Feed

Purpose: daily AI reward feed optimized for opportunity hunters who want to decide quickly without login.

Sections:

- Today’s AI Opportunities
- Trending AI Projects
- Free Credits
- Possible Airdrops
- GitHub/Open Source Tasks
- Agent Trials
- Bounties
- Newly Added

Each card shows:

- Project name and logo
- One-line hook
- Reward type
- Task difficulty
- Estimated time
- Credibility label
- Expiry date if any
- Why ranked: one short AI-generated explanation
- Source/trust labels: Official Source / Verified / Unverified / AI Summary / Last Checked
- Risk labels: Reward Not Guaranteed / Sponsored / High Risk / Requires Wallet if applicable
- CTA: “View task”, “Go claim”, “Open GitHub”, “Try agent”, or “View official source”

#### Project Page

Shows:

- Project overview
- Why it matters
- Available tasks
- Reward details
- GitHub/social links
- Credibility signals
- Risk notes
- Similar projects

#### Task Page

Purpose: answer whether the user should spend time on the opportunity.

Shows:

- Task instructions
- Reward / upside
- Estimated time
- Proof needed
- Official links
- Warnings
- CTA outbound link
- Why ranked
- Source evidence
- Last checked timestamp
- Report/update link

#### Leaderboard

Weekly rankings:

- Hottest AI rewards
- Fastest-growing open-source AI projects
- Most valuable free credits
- Trending agents
- Most completed tasks

#### Submit Project

Simple form optimized for minimal friction. V1 should require only a URL and type; AI extracts the rest. Additional fields are optional:

- URL
- Type: project / opportunity / free credits / GitHub repo / agent / bounty / correction / risk report
- Optional note
- Optional contact
- Optional budget/featured interest for project teams

### Optional Logged-In Features

Login should not block browsing.

Add only for:

- Save task
- Mark as completed
- Claim reward if AICookieDao intermediates the reward
- Build hunter/builder profile
- Subscribe to alerts

Login methods:

- GitHub
- X
- Email magic link

## 3. Admin Workflow

Start with a simple admin spreadsheet or lightweight CMS, but use AI to draft summaries, tags, scores, risk labels, and leaderboard copy.

Fields:

- AI-generated summary
- AI-generated tags
- AI score rationale
- Project ID
- Project name
- Category
- Tags
- Website
- GitHub
- X
- Discord
- Logo
- Short hook
- Long description
- Reward type
- Reward value
- Task difficulty
- Task steps
- Official link
- UTM link
- Expiry
- Verification method
- Risk notes
- Status: draft / live / archived
- Featured: true/false

Manual curation is acceptable for the first 100-300 listings.

## 4. Core Data Model

### Project

- id
- name
- slug
- logoUrl
- websiteUrl
- githubUrl
- xUrl
- discordUrl
- category
- tags
- description
- credibilityScore
- riskScore
- createdAt
- updatedAt

### Opportunity

- id
- projectId
- title
- slug
- summary
- taskType
- rewardType
- rewardValueText
- difficulty
- estimatedTime
- officialUrl
- trackingUrl
- proofRequired
- startsAt
- endsAt
- status
- featured
- createdAt
- updatedAt

### UserAction

- id
- userId nullable
- opportunityId
- actionType: view / outbound_click / save / complete / claim
- anonymousId
- referrer
- createdAt

### Submission

- id
- submitterName
- contact
- projectName
- projectUrl
- githubUrl
- rewardDescription
- campaignBudget
- status
- notes
- createdAt

## 5. Anti-Abuse Principles

- Do not promise exact GitHub star delivery
- Do not require spam comments or low-quality posts
- Disclose sponsored/featured placements
- Prefer official links
- Mark risky/unclear rewards
- Let users report suspicious campaigns
- Track unusual click/completion patterns

## 6. Monetization In MVP

### Free Listing

Projects can submit for free. Approval is curated.

### Featured Listing

Paid placement on:

- Home feed
- Category page
- Weekly newsletter
- Telegram/Discord digest

### Campaign Package

Manual package for AI projects:

- Campaign page
- Task design
- Weekly report
- Creator/developer outreach
- UTM tracking
- Featured placement

### Data/Report

Sell a simple report:

- Traffic sent
- Clicks
- Saved tasks
- GitHub lift estimate
- Social mentions
- Recommended next campaign

## 7. MVP Success Metrics

User side:

- 1,000+ weekly unique visitors
- 20%+ outbound CTR on task cards
- 10%+ return visitors
- 500+ email/Telegram subscribers
- 100+ saved/completed actions if login exists

Project side:

- 50+ submitted projects
- 10+ project teams contacted
- 3+ paid featured listings or campaign pilots
- 1+ repeat paying project

Content side:

- 100+ curated opportunities
- Weekly leaderboard shipped consistently
- Daily or near-daily new tasks

## 8. First 30 Days Execution

Week 1:

- Build static/feed MVP
- Curate first 50 opportunities
- Launch Telegram/email digest
- Create project submission form

Week 2:

- Add leaderboard
- Add tracking links
- Contact 30 AI projects
- Publish first weekly AI rewards report

Week 3:

- Add AI-generated weekly digest
- Add optional login/save
- Add claim/completed status
- Run 2 manual pilot campaigns
- Recruit first 20 power hunters/builders

Week 4:

- Package paid featured listing
- Publish campaign ROI examples
- Add project dashboard mock/report
- Contact 100 more projects

## 9. MVP Copy

Homepage headline:

> Discover AI projects that reward early users.

Chinese headline:

> 每天发现值得薅的 AI 项目。

Subheadline:

> Free credits, possible airdrops, GitHub tasks, agent trials, bounties, grants, and early-access campaigns — curated in one lightweight feed.

Chinese subheadline:

> AI 积分、免费额度、潜在空投、GitHub 任务、Agent 试用、开发者赏金、内测资格，一站追踪。

CTA:

- Browse Today’s Opportunities
- Submit Your AI Project
- Get Weekly AI Rewards

Project-side CTA:

> Get real users, builders, and creators for your AI project — without buying fake stars.


## 10. V1 UX Logic

V1 should optimize for opportunity hunters first. A user should be able to open the homepage, scan cards, understand reward/upside, effort, credibility, risk, and click an official link within 30 seconds.

Core UX principles:

- Browse before login
- One-screen judgment from cards
- Visible source and risk labels
- One-click outbound to official sources
- Simple filters for Free Credits, Possible Airdrop, GitHub, Agent Trial, Bounty, No Login, 5 Min, Verified, Ending Soon
- AI summaries must be labeled as AI-generated
- Sponsored placement must be visually separated from organic ranking

Opportunity detail pages must answer: what it is, what users can get, what they need to do, how long it takes, whether it is official, what risks exist, and where to go next.
