# AI Automation Strategy

## 1. Core Principle

AICookieDao should be an AI-native automated ranking and discovery engine, not a manually operated bounty platform.

The platform should feel like:

> AI agents scan the internet every day, discover new AI opportunities, score them, summarize them, publish leaderboards, and route users to official links.

Human work should focus only on:

- Final review for risky/high-visibility listings
- Paid customer conversations
- Editorial taste and brand direction
- Abuse handling

Everything else should be automated as much as possible.

## 2. Product Shape

The product should remain lightweight:

- No mandatory user registration
- No heavy campaign setup
- No complex reward escrow at launch
- No DAO governance at launch
- No manual task marketplace operations
- No custom integration required from projects

Instead, use AI to produce:

- Auto-discovered opportunity cards
- Auto-generated project summaries
- Auto-updated leaderboards
- Auto-created category pages
- Auto-written weekly reports
- Auto-generated social posts
- Auto-risk labels
- Auto-project outreach drafts

## 3. Automation Pipeline

### Step 1: Source Monitoring

AI crawlers/agents monitor public sources:

- GitHub Trending and GitHub search
- ProductHunt AI launches
- Hugging Face trending spaces/models/datasets
- X posts from AI founders/projects when submitted or selectively checked; do not depend on paid X API in V1
- Reddit AI communities
- Hacker News launch posts
- Discord/Telegram channels if submitted or available
- AI newsletters
- Agent directories
- MCP server lists
- Hackathon/grant pages
- Cloud/API credit pages
- Web3 x AI points/quest pages

Output:

- Raw project candidates
- Raw opportunity candidates
- Source URLs
- Time discovered

### Step 2: AI Extraction

For each candidate, AI extracts:

- Project name
- Website
- GitHub URL
- Category
- What the product does
- Reward/opportunity type
- Task steps
- Reward value if stated
- Expiry date
- Official source links
- Risk signals
- Target user type

Output:

- Structured project record
- Structured opportunity record

### Step 3: AI Deduplication

AI merges duplicates by:

- Same domain
- Same GitHub repo
- Same project name variants
- Same social handle
- Similar descriptions

Output:

- Clean project graph
- Linked opportunities per project

### Step 4: AI Scoring

AI assigns initial scores:

- Opportunity value
- Momentum
- Credibility
- Ease of participation
- AI relevance
- Developer relevance
- Reward clarity
- Risk score
- Scam/spam likelihood

Output:

- Rank score
- Category scores
- Explanation for ranking

### Step 5: Data Enrichment

System enriches with public metrics:

- GitHub stars, forks, issues, PRs
- Star velocity
- Recent commits/releases
- Contributors
- Package links if known
- Social links
- Website availability
- Existing listing history
- AICookieDao outbound clicks

Output:

- Updated ranking metrics

### Step 6: AI Content Generation

AI generates:

- One-line hook
- Short summary
- Task instructions
- “Why it matters” section
- Risk/credibility note
- Category tags
- SEO title/description
- Social post copy
- Newsletter blurb

Output:

- Draft listing/page content

### Step 7: Human-in-the-Loop Review

Only review:

- Sponsored/paid listings
- High-risk airdrop/points campaigns
- Projects asking for suspicious permissions
- Listings with unclear official source
- Top homepage placements

Most low-risk listings can auto-publish with “auto-discovered” label.

### Step 8: Auto-Publishing

System publishes:

- Daily leaderboard
- Category rankings
- New opportunity pages
- Project pages
- Weekly archive pages
- RSS/newsletter drafts
- Social cards

## 4. AI Agents Needed

### Discovery Agent

Finds new AI projects, rewards, launches, repos, and campaigns.

Tasks:

- Search sources
- Monitor feeds
- Detect launch/reward language
- Save source URLs

### Extraction Agent

Turns messy webpages/posts into structured data.

Tasks:

- Extract project fields
- Extract reward/task details
- Identify official links
- Detect expiry and constraints

### Scoring Agent

Ranks opportunities and explains scores.

Tasks:

- Score value, ease, risk, momentum
- Compare within category
- Generate ranking rationale

### Risk Agent

Flags suspicious or low-quality opportunities.

Tasks:

- Detect fake/scam signals
- Detect unclear airdrop claims
- Detect excessive permissions
- Detect spammy task requirements
- Suggest warning labels

### Content Agent

Writes page copy and social content.

Tasks:

- Summarize project
- Generate task card copy
- Generate SEO metadata
- Generate X/Telegram/newsletter copy

### Outreach Agent

Helps convert project-side demand.

Tasks:

- Find project contact
- Draft personalized outreach
- Suggest campaign angle
- Prepare weekly performance report

### Analyst Agent

Turns data into trend reports.

Tasks:

- Weekly top movers
- Category trends
- Emerging agent projects
- Fastest-growing GitHub repos
- Most clicked opportunities

## 5. Minimal Human Workflow

Daily human workflow should be under 30 minutes:

1. Review top auto-discovered opportunities.
2. Approve/reject risky listings.
3. Pick 3-5 homepage highlights.
4. Publish or approve AI-generated daily digest.
5. Reply to project submissions and paid leads.

Weekly human workflow:

1. Review weekly leaderboard.
2. Publish weekly report.
3. Contact top projects with their ranking.
4. Offer featured listing or launch boost.

## 6. Automated Ranking Pages

Pages should be generated from data, not manually written every time:

- `/leaderboard/free-ai-credits`
- `/leaderboard/ai-points-airdrops`
- `/leaderboard/open-source-ai`
- `/leaderboard/ai-agents`
- `/leaderboard/ai-bounties`
- `/leaderboard/mcp-tools`
- `/leaderboard/rag-tools`
- `/leaderboard/ai-devtools`
- `/projects/[slug]`
- `/opportunities/[slug]`
- `/weekly/YYYY-WW`

## 7. AI-First User Experience

The frontend should expose AI-generated explanations clearly:

- “Why it is ranked”
- “Best for”
- “Estimated effort”
- “Reward clarity”
- “Risk note”
- “Similar opportunities”
- “AI summary from official sources”

This creates trust and reduces manual writing.

## 8. Lightweight Tech Architecture

Suggested simple stack:

- Static/SSR frontend
- Database for projects/opportunities/scores
- Scheduled jobs for crawling and scoring
- LLM pipeline for extraction/summarization/scoring
- Admin review queue
- UTM/click tracking
- Newsletter/Telegram automation

Avoid early complexity:

- No reward escrow
- No wallet system
- No token logic
- No complex user social graph
- No project SDK
- No full CRM

## 9. Auto-Discovery Query Examples

Search patterns:

- “AI free credits”
- “LLM API credits”
- “AI agent launch”
- “AI points program”
- “AI quest campaign”
- “open source AI agent GitHub”
- “MCP server GitHub”
- “AI hackathon bounty”
- “AI developer grant”
- “agent framework GitHub”
- “RAG framework GitHub”
- “AI startup waitlist credits”

## 10. Quality Controls

Even with automation, trust matters.

Required controls:

- Store original source URL for every claim
- Mark AI-generated summaries
- Mark unverified rewards
- Keep last-checked timestamp
- Require official source for reward claims
- Allow user reports
- Do not publish high-risk campaigns without review
- Do not guarantee airdrops, stars, or rewards

## 11. Low-Cost Constraint

Do not make official X API, paid social listening, or proxy-heavy crawling required for V1. Prefer GitHub public data, RSS, project/user submissions, public pages, internal click data, and AI-assisted review.

## 12. MVP Automation Scope

First automation features to build:

1. GitHub repo metric enrichment
2. AI summary from URL/source text
3. AI tagging and categorization
4. AI opportunity score
5. Auto-generated leaderboard pages
6. Auto-generated weekly digest draft
7. Admin approve/reject queue

Defer:

- Fully autonomous crawling across all platforms
- Automated reward verification
- Complex anti-sybil graph
- User reputation engine
- Project-side dashboard
- API product
