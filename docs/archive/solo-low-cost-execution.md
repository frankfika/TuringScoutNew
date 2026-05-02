# Solo Low-Cost Execution Plan

## 1. Reality Constraint

AICookieDao must be designed for one person to run with low cash cost.

So the product should avoid:

- Expensive X/Twitter API dependency
- Expensive paid data providers
- Heavy manual research
- Heavy user verification
- Complex reward escrow
- Large moderation workload
- Custom integrations with every project
- Full social graph crawling

The platform should rely on:

- Public web sources
- GitHub API/free public data
- RSS feeds where available
- Search-engine indexing
- User/project submissions
- AI-assisted extraction and scoring
- Manual review only for top/risky items
- Outbound links instead of in-platform task completion

## 2. Cost-Aware Data Strategy

### Principle

Do not try to monitor the whole internet. Monitor a small number of high-signal sources deeply, and let submissions fill the gaps.

### Source Priority

#### Tier 1: Free / Low-Cost / High-Signal

Use these first:

- GitHub search/trending/topics
- GitHub repo API
- ProductHunt public pages/RSS if available
- Hacker News Algolia API
- Reddit public RSS/search pages where feasible
- Hugging Face trending pages
- GitHub awesome lists
- Project websites/blogs/RSS feeds
- Dev.to RSS/search
- Medium/public blog pages if accessible
- arXiv / Papers with Code for AI research-product signals
- Google/Bing search result snippets where permitted
- User/project submissions

#### Tier 2: Semi-Manual / AI-Assisted

Use these with selective monitoring:

- X/Twitter public pages manually or via user-submitted links
- Zhihu public search/pages
- WeChat public account article links submitted by users
- Jike/Xiaohongshu/Bilibili links submitted by users
- Discord/Telegram announcements submitted by projects/users
- Newsletters forwarded/submitted by users

#### Tier 3: Avoid At Launch

Avoid until revenue exists:

- Official X API at scale
- Expensive social listening tools
- Paid Reddit firehose/data APIs
- Paid media monitoring platforms
- Enterprise GitHub analytics tools
- Proxy-heavy scraping infrastructure

## 3. X/Twitter Strategy Without Paying Much

X is still important, but do not make it a hard dependency.

### What To Do

- Let users/projects submit X post URLs.
- Let AI summarize submitted X links when content is accessible.
- Track only a curated list of project/founder accounts manually or with low-frequency checks.
- Use X mostly as a signal source, not the core database.
- Embed or link to X posts instead of ingesting everything.
- Use project self-submissions: “Add your X launch post”.

### What Not To Do

- Do not build full X search monitoring in V1.
- Do not depend on real-time X firehose.
- Do not calculate exact X mindshare in V1.
- Do not promise creator attribution based on complete X data.

### Practical Substitute

Instead of “X mindshare”, use “public signal score”:

- GitHub momentum
- ProductHunt/HN/Reddit presence
- Submitted social links
- Website/blog activity
- AICookieDao clicks
- User saves/submissions

This is cheaper and still useful.

## 4. Chinese Public-Channel Strategy

Chinese sources are valuable but hard to crawl cleanly.

### WeChat Official Accounts

Do not try to crawl WeChat at scale in V1.

Use:

- User-submitted article links
- Project-submitted article links
- Manual weekly curation
- AI extraction from accessible article text when possible

### Zhihu

Use:

- Public search manually/low-frequency
- User-submitted links
- AI summaries of accessible pages

### Bilibili / Xiaohongshu / Jike

Use:

- Submitted links
- Manual weekly source checks
- Creator self-submissions

### Practical Framing

Chinese social signals should be treated as editorial/context signals first, not exact ranking data.

## 5. Reddit Strategy

Reddit can be useful for organic AI discovery.

Low-cost approach:

- Monitor specific subreddits via public pages/RSS where possible
- Search weekly for terms like “AI credits”, “agent launch”, “open source agent”, “MCP”, “RAG tool”
- Use Reddit links submitted by users/projects
- Use Reddit as a discovery source, not as exact sentiment infrastructure

Potential subreddits:

- r/LocalLLaMA
- r/MachineLearning
- r/OpenAI
- r/ArtificialInteligence
- r/ChatGPTCoding
- r/AI_Agents
- r/selfhosted
- r/SaaS
- r/SideProject

## 6. GitHub As The Main Free Data Backbone

GitHub should be the most important structured source because it is relatively open and directly relevant to AI adoption.

Track:

- Stars
- Forks
- Watchers
- Open issues
- Pull requests
- Contributors
- Last commit
- Release activity
- Repo topics
- README quality signals
- License
- Package links

Derived metrics:

- Star velocity
- Fork velocity
- Activity score
- Maintainer responsiveness
- Contributor diversity
- Open-source credibility

This gives AICookieDao a strong AI/open-source angle without expensive social APIs.

## 7. User Submission As Data Acquisition

User/project submissions are not a fallback; they are a core growth loop.

Submission types:

- Submit AI opportunity
- Submit project
- Submit free credit campaign
- Submit possible airdrop/points campaign
- Submit GitHub repo
- Submit agent trial
- Submit bounty/grant
- Submit social proof link
- Report scam/risk

Make submission lightweight:

- No login required
- Email optional for follow-up
- URL required
- AI auto-extracts the rest

This turns users into discovery agents.

## 8. AI-Assisted Curation Workflow

Daily workflow for one person:

1. Run discovery job or open admin queue.
2. AI shows 20-50 candidate opportunities.
3. Each candidate has extracted fields, score, summary, risk label, and source link.
4. Human only chooses approve/reject/edit for top items.
5. AI publishes updated leaderboards and draft posts.

Target time:

- 20-30 minutes/day
- 1-2 hours/week for deeper review/report

## 9. MVP Ranking Without Expensive APIs

Use a practical low-cost score:

```
Rank Score = GitHub Momentum + Opportunity Value + Source Credibility + User Interest + Freshness + AI Relevance - Risk
```

### GitHub Momentum

Free/public data.

### Opportunity Value

AI-extracted from official page/submission.

### Source Credibility

Official website, GitHub repo, known company/team, public docs.

### User Interest

AICookieDao internal data:

- Page views
- Outbound clicks
- Saves if login exists
- User submissions
- Reports

This becomes your owned data moat and costs almost nothing.

### Freshness

New opportunities get a boost.

### AI Relevance

How strongly related to AI agents, AI tools, LLMs, open-source AI, credits, or bounties.

### Risk

Unclear rewards, scam signals, spammy tasks, suspicious domains.

## 10. Build Order For One Person

### Week 1: Static-Like Leaderboard MVP

- Create simple database or JSON/YAML data source
- Build homepage leaderboard
- Build category pages
- Build project/opportunity pages
- Build submit form
- Build outbound click tracking
- Add newsletter/Telegram link

### Week 2: AI Curation Helper

- Add URL-to-structured-listing extractor
- Add AI summary/tag/risk generation
- Add admin approve/reject queue
- Add GitHub metric enrichment

### Week 3: Auto Digest And Sharing

- Generate weekly leaderboard archive
- Generate social post drafts
- Generate newsletter draft
- Generate share cards/badges

### Week 4: Project Outreach And Monetization Test

- Auto-generate outreach messages for listed projects
- Send free ranking notification
- Offer featured listing manually
- Create simple performance report

## 11. Minimal Tooling

Prefer cheap/simple tools:

- GitHub API for repo metrics
- Static/SSR web app
- SQLite/Postgres/Supabase free tier or local DB initially
- Cron jobs/GitHub Actions if enough
- Basic LLM API usage with strict batching/caching
- RSS readers/parsers
- Admin page instead of full CMS
- Plausible/Umami/self-hosted analytics or simple click table

Avoid:

- Heavy scraping SaaS
- Full CRM
- Expensive analytics stack
- Paid social listening
- Complex queue infra before needed

## 12. LLM Cost Control

AI usage should be cached and batched.

Rules:

- Never summarize the same URL repeatedly unless source changed.
- Store extracted structured data.
- Use small/cheap model for extraction/tagging.
- Use stronger model only for weekly reports or hard judgment.
- Limit candidate processing per day.
- Use deterministic scoring where possible.
- Use AI for drafts, not endless re-generation.

## 13. Fairness Under Low Data

Because V1 will not have complete social data, be transparent.

Use labels:

- AI-estimated
- Source verified
- User submitted
- Auto-discovered
- Last checked
- Reward unverified

Do not claim:

- Complete market coverage
- Exact X mindshare
- Exact sentiment across the internet
- Guaranteed reward

## 14. One-Person Operating Model

Daily:

- Approve top new items
- Check reports
- Publish digest

Weekly:

- Curate one high-quality report
- Notify ranked projects
- Ask 10 projects to submit/update campaigns
- Sell 1-2 featured slots

Monthly:

- Review ranking quality
- Improve source list
- Add automation for the most repetitive task
- Publish category trend report

## 15. Key Product Design Implication

The product should not say:

> We track all AI mindshare across X, Reddit, WeChat, Zhihu, and GitHub.

It should say:

> We use AI to discover, score, and explain high-signal AI opportunities from public sources, submissions, GitHub data, and community signals.

This is honest, cheaper, and still valuable.
