# 04 V1 UX Spec

Canonical status: current source of truth for V1 user experience.


## UX Goal

A new user should find, understand, and click a useful AI opportunity within 30 seconds without logging in.

## Fast User Explanation

Homepage copy should make the product obvious in one glance:

```text
AI 项目机会榜
每天发现值得薅、值得试、值得关注的 AI 项目。

看收益、看难度、看来源、看风险，30 秒决定要不要试。
```

English alternative:

```text
AI opportunities worth trying today.
Ranked by value, credibility, momentum, effort, and risk.
```

Social loop copy:

```text
发现好机会？可以提交线索、纠错或内容，被标记为 Spotted by / Top Voice。
项目被看见，创作者也被看见。
```

## UX Principles

- **Browse-first**: no login before browsing, filtering, details, or outbound clicks
- **One-screen judgment**: cards show reward, effort, trust, risk, and CTA
- **Trust-labeled**: source and risk labels are visible everywhere
- **One-click outbound**: official project links are the primary action
- **Opportunity-hunter first**: prioritize upside, time, difficulty, and risk over deep analytics
- **Creator-visible**: give public credit to scouts and creators who surface, explain, validate, correct, or optionally submit useful opportunities

## Homepage UX

Primary job: show today’s best opportunities immediately.

Recommended structure:

1. Hero: “Today’s AI opportunities, ranked by value, credibility, and momentum.”
2. Top 10 Today’s AI Opportunities
3. Quick filters
4. Spotted by AI Scouts / Top Voices preview
5. Category leaderboard previews
6. Rising Open-Source AI Projects
7. Trending AI Agents / MCP Tools
8. Optional correction / social proof CTA
9. Subscribe CTA

Quick filters:

- Free Credits
- Possible Airdrop
- GitHub
- Agent Trial
- Bounty
- No Login
- 5 Min
- Verified
- Ending Soon

## Opportunity Card UX

Each card must show:

- project name
- opportunity hook
- reward/upside type
- estimated time
- difficulty
- trust label
- risk label
- why ranked
- spotted by / useful social proof count when available
- primary CTA

Example card content:

```text
Project: ExampleAI
Hook: Claim free API credits for testing a new agent SDK
Reward: Free Credits
Time: 5 min
Trust: Official Source
Risk: Reward availability may change
Why ranked: active GitHub repo + clear official offer + low effort
CTA: Go claim
```

Creator/social proof line examples:

```text
Spotted by: @scoutname
Useful context: 3 creator posts, 1 tutorial, 1 project reply
```

## Opportunity Detail UX

The page must answer:

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
- spotted by / explained by / useful creator links
- similar opportunities
- report/update link

## Project Page UX

Purpose: show everything known about one AI project.

Sections:

- project summary
- official links
- GitHub metrics if available
- active opportunities
- ranking appearances
- top scouts / top voices
- useful creator content and project acknowledgements
- source evidence list
- risk/credibility notes
- similar projects

## Category Leaderboard UX

Each category page should include:

- category explanation
- ranking methodology for that category
- ranked cards
- filters
- last updated time
- source/risk legend

## Submit / Correction Page UX

Purpose: make optional submissions, corrections, risk reports, and creator credit effortless.

This page should not feel like the main product loop. The main product loop is automated discovery and ranking; this page is a lightweight improvement path.

Required fields:

- URL
- type

Type options:

- project
- opportunity
- free credits
- GitHub repo
- agent
- bounty
- correction
- risk report

Optional fields:

- note
- contact
- social handle
- content/post URL
- budget/featured interest

AI extracts project name, summary, category, tags, reward, task steps, source, and risk.

## Creator / Scout UX

V1 should make social participation lightweight:

- no login required to submit a correction, content/proof URL, or credit request
- optional display name/social handle for public credit
- clear checkbox for "show me publicly as spotted by/explained by"
- share card generated after approval
- public Top Scouts/Top Voices preview can be weekly and manually curated at first
- creator content is labeled separately from official project sources

Avoid:

- implying creators will definitely earn rewards
- rewarding raw post volume
- showing private contact information publicly
- mixing paid creator campaigns with organic scout recognition

## Label System

Trust labels:

- Official Source
- Verified
- Unverified
- AI Summary
- Last Checked

Risk labels:

- Reward Not Guaranteed
- High Risk
- Requires Wallet
- Possible Spam Task
- No Clear Reward Terms

Utility labels:

- No Login
- 5 Min
- Beginner Friendly
- Builder Task
- Ending Soon

Commercial labels:

- Sponsored
- Featured
- Partner Campaign

## Login UX

V1 should not require login.

Login can appear later for:

- save opportunity
- mark completed
- submit proof
- build contributor profile
- subscribe to personalized alerts

## UX Anti-Patterns

Avoid:

- login wall before browsing
- too many metrics on cards
- guaranteed airdrop language
- sponsored cards that look organic
- unclear source provenance
- AI speculation presented as fact
- platform-native task completion before value is clear
- dark-pattern countdowns or fake scarcity
