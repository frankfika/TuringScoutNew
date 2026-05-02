# OpenClaw / Agent Ops Architecture

## 1. Goal

AICookieDao should be operated by agents, not by the founder manually.

The founder should act as:

- strategy owner
- final approver for risky/high-value items
- monetization closer
- occasional quality editor

The system/agents should handle:

- discovery
- crawling
- extraction
- deduplication
- enrichment
- scoring
- risk labeling
- publishing
- digest generation
- project notifications
- report drafting
- issue monitoring

Target human workload:

- Daily: 10-20 minutes
- Weekly: 1-2 hours
- Manual work only for exceptions, not routine operations

## 2. Operating Model

Use an agent-orchestrated OPC pipeline.

```text
OpenClaw / Agent Orchestrator
  -> Discovery Agents
  -> Collector Agents
  -> Extraction Agents
  -> Dedup Agents
  -> Enrichment Agents
  -> Scoring Agents
  -> Risk Agents
  -> Publishing Agents
  -> Outreach Agents
  -> Reporting Agents
  -> Human Review Queue
```

The product should have a queue-based workflow. Agents create candidates and recommendations; humans approve only when necessary.

## 3. Agent Roles

### 3.1 Source Scout Agent

Purpose: find new sources and new opportunities.

Inputs:

- source registry
- keyword list
- category list
- previous discoveries

Actions:

- search GitHub, HN, Reddit, Hugging Face, ProductHunt, RSS feeds, public pages
- collect candidate URLs
- classify source type
- store raw evidence

Output:

- raw evidence records
- candidate project/opportunity URLs

Frequency:

- daily for high-signal sources
- weekly for lower-signal sources

Human review:

- not required unless source is suspicious

### 3.2 GitHub Intelligence Agent

Purpose: make GitHub the structured data backbone.

Actions:

- discover AI repos by topic/search/awesome lists
- enrich repo metrics
- snapshot metrics over time
- calculate star/fork/activity velocity
- detect fast-rising repos
- detect stale or suspicious repos

Output:

- repo metric snapshots
- open-source momentum scores
- candidate projects

Frequency:

- daily for tracked repos
- weekly for broad discovery

### 3.3 Opportunity Extraction Agent

Purpose: turn messy URLs into structured opportunity records.

Actions:

- read source page/text
- extract project, reward, task, eligibility, expiry, official link
- identify opportunity type
- generate summary and task steps
- mark source confidence

Output:

- opportunity candidate
- project candidate if missing
- extraction confidence

Human review:

- required only if confidence is low or risk is high

### 3.4 Entity Merge Agent

Purpose: deduplicate projects and opportunities.

Actions:

- match by domain, GitHub repo, project name, social handle, description similarity
- merge duplicate evidence into one project/opportunity
- flag ambiguous matches

Output:

- merged project profiles
- duplicate warnings
- ambiguous review queue

### 3.5 Risk And Trust Agent

Purpose: protect users and maintain fairness.

Actions:

- detect scam-like rewards
- detect wallet/private-key risk
- detect spam tasks
- detect fake-star wording
- check if official source exists
- assign risk labels
- decide whether human review is mandatory

Output:

- risk score
- risk labels
- review requirement

### 3.6 Scoring Agent

Purpose: rank opportunities and projects.

Actions:

- compute deterministic score
- generate AI ranking explanation
- adjust score by leaderboard type
- flag abnormal jumps

Output:

- leaderboard ranks
- score rationale
- score history

### 3.7 Publishing Agent

Purpose: publish updated pages with minimal manual work.

Actions:

- generate/update opportunity pages
- generate/update project pages
- regenerate category leaderboards
- generate weekly archive pages
- add last-checked timestamp
- add source links and risk labels

Output:

- public pages ready for deployment
- changelog of updates

Human review:

- only for homepage top placements, sponsored items, or high-risk items

### 3.8 Content Repurposing Agent

Purpose: turn rankings into distribution content.

Actions:

- generate Telegram post
- generate X post draft
- generate newsletter draft
- generate Zhihu/公众号 outline
- generate weekly report
- generate share cards copy

Output:

- daily/weekly content drafts

Human review:

- recommended before publishing externally

### 3.9 Project Outreach Agent

Purpose: convert organic ranking into project-side relationships.

Actions:

- identify projects newly ranked or rising
- find public contact info if available
- draft personalized message
- include ranking, clicks, and suggested campaign angle
- create follow-up reminders

Output:

- outreach queue
- email/DM drafts
- project CRM notes

Human review:

- approve/send manually at first

### 3.10 Report Agent

Purpose: create monetizable reports.

Actions:

- summarize clicks and ranking movement
- compare project with category peers
- identify traffic sources
- suggest campaign improvements
- produce project report draft

Output:

- weekly public report
- private project report draft

### 3.11 Feedback And Cleanup Agent

Purpose: keep the database clean.

Actions:

- detect broken links
- detect expired opportunities
- detect old reward pages
- process user reports
- suggest archive/update actions

Output:

- cleanup queue
- expired opportunity list
- correction suggestions

## 4. Queue Design

Everything should flow through queues so humans do not chase tasks manually.

### Queues

- `raw_evidence_queue`
- `extraction_queue`
- `dedupe_queue`
- `enrichment_queue`
- `risk_review_queue`
- `publish_queue`
- `human_review_queue`
- `outreach_queue`
- `report_queue`
- `cleanup_queue`

### Human Review Queue Priority

1. Sponsored submissions
2. High-risk opportunities
3. Homepage top 20
4. Ambiguous duplicates
5. User reports
6. Big ranking jumps
7. Project correction requests

Everything else should auto-publish if confidence is high and risk is low.

## 5. Autonomy Levels

### Level 0: Manual

Human does everything. Avoid except early seed data.

### Level 1: Agent Drafts, Human Publishes

Agents extract, summarize, and score. Human approves every listing.

Use for first 1-2 weeks.

### Level 2: Auto-Publish Low-Risk Items

Low-risk, high-confidence items auto-publish. Human reviews only risky/top/sponsored items.

This should be the normal V1 operating mode.

### Level 3: Auto-Notify And Auto-Report

Agents generate reports and outreach. Human approves sending.

### Level 4: Semi-Autonomous Growth Ops

Agents publish digests, notify projects, and create campaign suggestions automatically with safety limits.

Use after trust is established.

## 6. Human Workload Design

### Daily Founder Dashboard

Show only:

- new high-value opportunities
- high-risk queue
- top ranking changes
- broken/expired links
- paid/sponsored leads
- suggested daily digest

Daily actions:

- approve/reject 5-20 items
- approve digest
- respond to paid leads

### Weekly Founder Dashboard

Show:

- weekly leaderboard summary
- fastest rising projects
- most clicked opportunities
- best project outreach targets
- report drafts
- monetization leads

Weekly actions:

- publish weekly report
- approve outreach batch
- sell featured/campaign packages

## 7. OpenClaw Integration Assumptions

If OpenClaw can run browser/search/coding/data agents, use it as the orchestration layer.

Expected OpenClaw responsibilities:

- scheduled web research tasks
- source crawling
- data extraction from pages
- GitHub metric jobs
- LLM summarization/scoring
- queue processing
- report generation
- admin alerts

If OpenClaw has task templates, create templates for each agent role:

- `discover_ai_opportunities`
- `extract_opportunity_from_url`
- `enrich_github_repo`
- `score_opportunity`
- `risk_check_opportunity`
- `generate_leaderboard_update`
- `generate_weekly_digest`
- `draft_project_outreach`
- `cleanup_expired_opportunities`

## 8. Agent Task Contracts

Every agent output should be structured JSON plus a short human-readable summary.

### Example: Opportunity Extraction Output

```json
{
  "project_name": "ExampleAI",
  "opportunity_title": "Claim free API credits",
  "opportunity_type": "free_credits",
  "reward_type": "api_credits",
  "reward_value_text": "$20 credits",
  "official_url": "https://example.com/credits",
  "source_urls": ["https://example.com/blog/launch"],
  "difficulty": "5_min",
  "estimated_time_minutes": 5,
  "task_steps": ["Create account", "Verify email", "Open billing credits page"],
  "risk_labels": ["official_source_found"],
  "confidence": 0.86,
  "needs_human_review": false
}
```

### Example: Scoring Output

```json
{
  "opportunity_id": "opp_123",
  "leaderboard": "free_ai_credits",
  "score": 82,
  "score_components": {
    "value": 80,
    "credibility": 85,
    "momentum": 70,
    "ease": 90,
    "freshness": 75,
    "user_interest": 60,
    "risk": 10
  },
  "ranking_explanation": "Ranked highly because the reward is clear, the task is easy, and the source is official.",
  "needs_human_review": false
}
```

## 9. Safety Rails For Automation

Agents can auto-publish only if:

- official source exists, or source confidence is high
- risk score is below threshold
- no wallet/private key request
- no fake-star/spam wording
- no sponsored claim without label
- no copied long-form content
- confidence score is high

Agents must require human review if:

- reward is high but unclear
- airdrop/token claim is speculative
- user reports issue
- project asks for sensitive permissions
- ranking jump is abnormal
- project is in homepage top slots
- listing is sponsored

## 10. Founder Time-Saving Priorities

Build automation in this order:

1. URL-to-listing extraction
2. GitHub metric enrichment
3. AI scoring and risk labeling
4. Admin approval queue
5. Auto-publishing leaderboards
6. Daily/weekly digest generator
7. Project outreach drafts
8. Cleanup/expiry detector
9. Contribution attribution
10. Sponsored campaign reporting

Do not spend early time on:

- perfect UI
- complex user profiles
- wallets/tokens
- full social crawling
- exact X mindshare
- complex creator payout system

## 11. Minimal Initial Agent Stack

If resources are limited, start with five agents:

1. Discovery Agent
2. Extraction Agent
3. GitHub Enrichment Agent
4. Scoring/Risk Agent
5. Publishing/Digest Agent

This is enough to reduce founder workload dramatically.

## 12. Success Metrics For Automation

Automation is working if:

- 80%+ candidate listings are AI-extracted without manual typing
- 60%+ low-risk listings auto-publish
- daily review queue stays below 20 items
- weekly report is 80% AI-generated
- project outreach drafts need only light editing
- founder spends less than 30 minutes/day on routine ops

## 13. Final Operating Principle

The platform should not ask the founder to be the crawler, editor, analyst, marketer, and salesperson at the same time.

Agents should do routine work. The founder should only make judgment calls and close value.
