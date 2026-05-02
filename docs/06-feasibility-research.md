# 06 Feasibility Research

Canonical status: feasibility assessment as of 2026-05-02.


## Executive Conclusion

Overall verdict:

> V1 is feasible, but only if TuringScout stays sharply focused on "AI opportunities worth acting on today" instead of becoming another generic AI tools directory.

The strongest wedge is:

> AI 项目机会榜：用来源、收益、难度、风险和行动入口，帮用户 30 秒判断一个 AI 项目今天值不值得试。

What is feasible now:

- Automated GitHub/public-source discovery + official URLs + raw evidence store + AI extraction + evidence-first rankings; user/project submissions are optional supplements.
- Daily/weekly AI opportunity leaderboards for open-source AI, agents, MCP tools, free credits, trials, bounties, and early access.
- Lightweight scout/creator credit using submitted social/content links rather than full social crawling.
- Low-cost automation with human review on high-risk, sponsored, wallet/token, unclear reward, and top-placement items.

What is not feasible or not worth doing in V1:

- Full social listening across X, WeChat, Zhihu, Reddit, Discord, Telegram, and Bilibili.
- Exact "global mindshare" measurement.
- Automated reward attribution or payout.
- DAO/token mechanics.
- Any promise of guaranteed GitHub stars, airdrops, rewards, or conversion.

Feasibility score:

| Area | Score | Judgment |
| --- | ---: | --- |
| Technical feasibility | 8/10 | Straightforward if V1 stays automation-first, GitHub/source-first, and submission-optional. |
| Data feasibility | 7/10 | Good for GitHub/Hugging Face/HN/official URLs; weak for full social. |
| Product feasibility | 7/10 | Strong if positioned as actionable opportunity board, weak as generic directory. |
| Social mechanism feasibility | 7/10 | Strong if creators get visible credit and projects acknowledge them; weak if treated as passive content aggregation. |
| Market feasibility | 6.5/10 | AI discovery demand exists, but category is crowded. |
| Operational feasibility | 6/10 | Freshness, dedupe, and review workload are the real challenge. |
| Monetization feasibility | 5.5/10 | Possible later, but only after trust and repeated traffic exist. |
| Compliance/trust feasibility | 5/10 | Manageable with conservative labels; risky if "airdrop/reward" language gets aggressive. |


## Market Reality

AI discovery is a real market, but it is already crowded.

Evidence:

- Stanford HAI's 2026 AI Index says generative AI reached broad adoption quickly, with organizational adoption at 88% and consumer adoption at 53% within three years.
- Menlo Ventures' 2025 enterprise AI report estimates generative AI spend grew to $37B in 2025, with $19B in the application layer.
- Futurepedia positions itself as a major AI discovery/education platform with thousands of curated tools and large user reach.
- Product Hunt, GitHub Trending, Hugging Face Hub, HN, Reddit, and many AI directories already cover "new AI tools" and "AI launches."

Implication:

- Demand is real.
- A plain AI directory is not differentiated.
- TuringScout must avoid competing on "we list more AI tools."
- The differentiated job should be "which AI opportunity is worth taking action on today?"

Recommended positioning:

- Do not lead with "DAO" in V1 marketing.
- Do not lead with "AI tools directory."
- Lead with "AI opportunity leaderboard."
- Use Adoptionshare and creator/scout reputation as internal strategic logic and later-stage business model, not as the first user-facing concept.


## Competitive Landscape

### Direct / Adjacent Competitors

| Competitor type | Examples | What they solve | Gap TuringScout can own |
| --- | --- | --- | --- |
| Product launch boards | Product Hunt, IndieHunt, EarlyHunt | New product discovery and launch visibility | Not focused on reward, effort, source trust, or claim/action workflow. |
| AI tool directories | Futurepedia, There's An AI For That, Toolify-style directories | Search and browse AI tools | Often broad/catalog-like; weak on "what can I get today?" and risk/source labels. |
| Developer trend boards | GitHub Trending, Trendshift | Open-source momentum | Weak on opportunity framing, reward/free-credit/bounty labels, and non-GitHub evidence. |
| AI model/demo hubs | Hugging Face Hub | Models, datasets, Spaces, demos | Strong supply, but not packaged as daily user opportunities. |
| Social/community discovery | HN, Reddit, X, Discord, WeChat groups | Real-time buzz | Scattered, noisy, hard to verify, hard to operationalize legally at scale. |

### Differentiation Test

TuringScout is differentiated only if every listing answers:

1. What is this AI project?
2. What can I get or do?
3. How much effort does it take?
4. Is the source official or unverified?
5. What are the risks?
6. Why is it ranked?
7. Where do I click next?

If the product only shows name, description, category, and visit button, it will look like another AI directory.


## Data Source Feasibility

### Source Assessment

| Source | Feasibility | Why | V1 Recommendation |
| --- | --- | --- | --- |
| GitHub public data | High | Official REST API supports public data; authenticated core limit is much higher than unauthenticated; search has specific limits. | Use authenticated API, cache snapshots, segment search queries, avoid live-heavy crawling. |
| GitHub Trending page | Medium | Useful public signal, but not a formal API. | Use carefully as a discovery input, not as the only ranking source. |
| Hugging Face Hub | High | Hub has open endpoints, Python/JS clients, OpenAPI spec, webhooks, and large model/dataset/Space supply. | Use for AI model/demo discovery and source enrichment. |
| Official project websites/docs/blogs | High | Best trust source when accessible. | Prioritize official URLs and last-checked timestamps. |
| User/project submissions | Medium/High | Useful for corrections, official updates, and scout/creator credit, but should not be required for daily operation. | Make submission effortless, optional, and secondary to automated discovery. |
| Hacker News | Medium/High | Official Firebase API is public and near real-time; HN/Algolia search is useful for discovery. | Use as secondary public signal and evidence source. |
| Product Hunt | Medium | API exists but requires access token; Product Hunt says default API use is not for commercial purposes without contacting them. | Use attribution, limited manual/import flow, or request permission before commercial-scale use. |
| Reddit | Medium/Low | API free tier exists, but developer terms restrict commercial/monetized use unless approved. | Avoid automated commercial dependency in V1; use submitted Reddit links as evidence. |
| X/Twitter | Low for V1 | API/pricing/terms are unstable and costly for broad monitoring. | Do not depend on it; accept submitted X links as evidence only. |
| WeChat/Zhihu/Bilibili/Xiaohongshu/Jike | Low for V1 automation | Crawling is brittle and compliance-heavy. | Use submitted links/manual review only. |
| Discord/Telegram | Low for broad crawling | Private/community content is hard to verify and permission-sensitive. | Use official public announcement links or optional project-provided links only. |

### Practical Data Strategy

V1 should use a source hierarchy:

1. Official project URL / docs / blog / GitHub repo.
2. Automated GitHub/Hugging Face/HN/Product Hunt/RSS/public evidence.
3. Automated or manual source-registry discoveries.
4. Optional project-submitted URL or correction.
5. Optional user/scout/creator-submitted source links.
6. Social links as evidence-only, never as sole proof for high-risk reward claims.

This keeps the product feasible and defensible.


## Technical Feasibility

### Build Complexity

V1 can be built with a conventional lightweight stack:

- database for sources, raw evidence, projects, opportunities, evidence, score snapshots, review queue, optional submissions, creator content, outbound clicks
- scheduled discovery/enrichment jobs
- AI extraction/scoring jobs
- admin review dashboard
- public SEO pages
- analytics events

Hard technical problems are limited if V1 avoids full crawling and attribution.

The harder problems are product/ops problems:

- keeping listings fresh
- deduplicating projects
- avoiding speculative AI summaries
- explaining ranking fairly
- preventing click/submission abuse without letting submissions dominate rankings
- reviewing risky listings quickly

### Data Moat Feasibility

The data moat is feasible if TuringScout stores raw evidence and derived structured records from day one.

Important data assets:

- raw evidence snapshots and checksums
- canonical project/opportunity graph
- GitHub metric snapshots and velocity
- source confidence and risk history
- creator/scout contribution records
- project acknowledgements/corrections
- outbound click data and optional submission/correction data
- score components over time

These assets are what make future project reports, Adoptionshare, campaign matching, and API products possible. Without them, the product stays a content site.

### AI Cost Feasibility

AI extraction is feasible at low volume.

Example directional estimate:

- 500 URLs/month
- 3,000-8,000 input tokens each after cleaned extraction
- 500-1,000 output tokens each
- using a low-cost model for extraction/classification

This is likely a small monthly cost compared with founder time, hosting, and data operations. The cost risk comes later if the system does large-scale web search, screenshots, full-page crawling, or repeated reprocessing without caching.

Rules:

- cache fetched pages and extracted fields
- re-run AI only when source content changes
- use small/cheap models for extraction/classification
- reserve stronger models for high-value summaries, ranking explanations, and review assistance


## Product Feasibility

### The Product Is Feasible If It Optimizes For Action

The first user session must feel like:

> I found something useful faster than I would through GitHub, X, Product Hunt, or random AI newsletters.

The product should not ask users to trust an opaque AI ranking. It should show:

- official source
- last checked
- reward/upside
- task steps
- effort/time
- trust/risk labels
- why ranked
- primary official CTA

### Strongest Initial Categories

Start with 3-4 categories, not 8.

Recommended V1 launch categories:

1. Open-Source AI Momentum
2. AI Agents / MCP Tools
3. Free AI Credits / Trials
4. AI Bounties / Builder Tasks

Treat "AI Points / Possible Airdrops" as a cautious, reviewed-only category because it is sticky but riskier.

### User Retention Risk

Daily repeat behavior is not guaranteed.

People will return only if:

- the board updates frequently
- listings are not generic
- opportunities expire or change enough to create urgency
- weekly digest is useful
- category pages rank in SEO
- the product becomes a trusted shortcut

If the content is mostly evergreen AI tools, repeat use will be weak.

### Social Influence Feasibility

The social mechanism is feasible and likely necessary.

TuringScout should not rely only on SEO or manual curation. It needs people who have a reason to bring signal into the system:

- scouts want to be early
- creators want topics, distribution, and project visibility
- projects want credible people talking about them
- users want trusted shortcuts

The feasible V1 version is not automated social crawling. It is lightweight public credit:

- `Spotted by`
- `Explained by`
- `Validated by`
- weekly `Top AI Scouts / Top Voices`
- creator links on opportunity/project pages
- project acknowledgements
- share cards that creators and projects want to repost

This improves feasibility because creators become a supply channel, distribution channel, and quality layer at the same time.

Main risk:

- if scoring rewards raw volume or follower size, it will attract spam.

Mitigation:

- score discovery quality, explanation usefulness, evidence quality, project acknowledgement, and adoption relevance more than raw likes or post count.


## Operational Feasibility

### Main Ops Load

Daily work will concentrate in:

- reviewing risky/high-value/sponsored/top-placement listings
- checking stale or broken offers
- merging duplicates
- correcting AI extraction errors
- improving source trust
- preparing daily/weekly distribution
- responding to project corrections

The target of 10-20 minutes/day is plausible only after:

- clear review rules exist
- low-risk auto-publish works
- broken/expired checks are automated
- top placements are limited
- categories are narrow

Before that, expect 45-90 minutes/day during seeding and launch.

### Minimum Human Review Rules

Human review is mandatory for:

- airdrop/token/wallet wording
- high-value rewards
- unclear eligibility
- no official source
- suspicious/referral-heavy tasks
- sponsored/featured placements
- homepage top 10
- user risk reports


## Monetization Feasibility

Monetization is possible, but not before trust.

Most realistic sequence:

1. Free listing and correction flow.
2. Labeled featured slots.
3. Newsletter/digest sponsorship.
4. Launch boost package.
5. Project ranking/report.
6. Developer adoption sprint.
7. Data/API products.

Early pricing in the existing GTM doc is directionally fine, but likely optimistic before proof of audience. A safer first paid pilot:

- $99-$299 for clearly labeled featured listing or launch package
- only after organic rankings and traffic are credible
- no promise of stars, airdrops, signups, or conversions

Do not sell "guaranteed adoption." Sell:

- visibility
- official listing quality
- source-backed placement
- digest inclusion
- click/report feedback


## Trust, Legal, And Compliance Risk

This is a trust-sensitive product because it may mention rewards, free credits, airdrops, bounties, or sponsored placements.

Core rules:

- Never guarantee rewards, airdrops, points, stars, or payouts.
- Use "possible", "reported", "unverified", and "reward not guaranteed" labels.
- Make sponsored/featured labels clear and close to the placement.
- Keep organic ranking independent from paid placement.
- Keep source links visible.
- Add report/update flow.
- Do not require wallet connection in V1.
- Do not ask users for private keys, seed phrases, or sensitive credentials.

FTC-style disclosure principle:

- If a placement is paid or affiliate-driven, disclosure should be clear, conspicuous, and close to the recommendation/action.


## Biggest Feasibility Risks

### Risk 1: Becoming Another AI Directory

Severity: High.

If TuringScout lists tools broadly, it competes with larger, older, SEO-heavy directories.

Mitigation:

- Make "opportunity" the atomic unit, not "tool."
- Cards must show upside, effort, source, risk, and CTA.
- Avoid generic descriptions.

### Risk 2: Stale Listings Destroy Trust

Severity: High.

Free credits, bounties, early access, and trials expire quickly.

Mitigation:

- Add last checked and expiration fields.
- Auto-check primary CTA availability.
- Decay stale scores.
- Expire uncertain opportunities aggressively.

### Risk 3: Overclaiming Airdrops / Rewards

Severity: High.

Speculative reward language can cause user harm and trust loss.

Mitigation:

- Use reviewed-only category for possible airdrops.
- Never say "guaranteed."
- Display "Reward Not Guaranteed" prominently.
- Prefer official reward terms over social rumor.

### Risk 4: Data Source Restrictions

Severity: Medium/High.

Product Hunt, Reddit, X, and social platforms have terms/rate limits that can restrict automated commercial use.

Mitigation:

- Do not depend on restricted APIs.
- Keep V1 source-first with GitHub, official URLs, Hugging Face, HN, RSS/public pages, and optional submissions.
- Use social links as submitted evidence only.

### Risk 5: Ranking Abuse

Severity: Medium.

Clicks/submissions can be gamed.

Mitigation:

- Cap user-interest weight.
- Deduplicate by visitor/session/opportunity.
- Downrank suspicious traffic.
- Require source and credibility components to dominate ranking.

### Risk 6: Project-Side Value Is Not Obvious

Severity: Medium.

Projects may not care unless they see traffic or useful feedback.

Mitigation:

- Send "you ranked this week" notifications.
- Provide free correction/update link.
- Show outbound click counts later after enough volume.
- Package project listing quality as a DevRel asset.


## 30-Day Validation Plan

### Week 1: Manual Supply Validation

Goal:

- Prove there are enough real opportunities.

Actions:

- Seed 80-120 projects/opportunities manually with AI assistance.
- Use only official/GitHub/Hugging Face/HN/Product Hunt/public-source evidence; use user-submitted evidence as optional supplement.
- Tag each item with reward, time, difficulty, source, risk, and CTA.

Pass criteria:

- At least 60 high-quality listings after dedupe.
- At least 20 listings feel time-sensitive/actionable.
- Less than 30% require risky/speculative wording.

### Week 2: User Demand Test

Goal:

- Prove people click and subscribe.

Actions:

- Launch public homepage/category/detail pages.
- Add outbound click tracking.
- Share daily top 5 lists in selected communities.
- Publish one weekly digest.

Pass criteria:

- 15%+ homepage-to-detail CTR.
- 20%+ detail-to-outbound CTR.
- 3%+ visitor-to-subscribe, share, report, or optional-submit rate.
- Qualitative feedback says "I found something useful."

### Week 3: Project-Side Test

Goal:

- Prove projects care about being listed.

Actions:

- Contact 30-50 ranked projects.
- Offer correction/update link.
- Ask whether they want official listing, launch boost, or report.

Pass criteria:

- 10%+ reply rate.
- 5+ projects submit corrections/official details.
- 1-3 ask about featured/report options.

### Week 4: Monetization Signal Test

Goal:

- Test willingness to pay without damaging trust.

Actions:

- Add clearly labeled featured module.
- Offer small paid pilot only to relevant projects.
- Do not alter organic rankings.

Pass criteria:

- At least 1 serious paid inquiry or pilot conversation.
- No negative user feedback about unclear sponsorship.


## Go / No-Go Criteria

Proceed with V1 build if:

- There are 60+ quality listings with source-backed opportunity value.
- Raw evidence exists for every published listing.
- Users click official links at meaningful rates.
- Projects respond to ranking/correction outreach.
- Scouts/creators share, correct, or optionally submit enough useful social proof to validate the influence loop.
- Daily ops can be kept under 60 minutes before automation.
- Risky/speculative listings are a minority.

Pause or pivot if:

- Most listings are generic AI tools with no action/upside.
- Outbound CTR is weak after improving copy and categories.
- Source freshness cannot be maintained.
- Project teams do not respond to listing/update outreach.
- User feedback centers on "I can find this elsewhere."

Avoid V2/V3 until:

- V1 has repeat users.
- Organic rankings are trusted.
- Projects submit official information.
- There is enough outbound/click/report data to justify attribution.


## Recommended Product Direction

### Best V1 Shape

Build:

- public AI opportunity leaderboard
- 3-4 focused categories
- source registry and raw evidence store
- automated discovery/enrichment jobs
- source-backed opportunity detail pages
- project pages
- optional no-login URL submission/correction
- review queue
- outbound tracking
- weekly digest
- methodology/trust page

Delay:

- login
- contributor profiles
- proof submission
- project claims
- paid campaigns
- points/token/DAO

### Best Public Copy

Chinese:

> AI 项目机会榜：每天发现值得薅、值得试、值得关注的 AI 项目，看收益、看难度、看来源、看风险，30 秒决定要不要试。

English:

> AI opportunities worth trying today, ranked by value, credibility, momentum, effort, and risk.


## Sources

- Stanford HAI, 2026 AI Index Report: https://hai.stanford.edu/ai-index/2026-ai-index-report
- Menlo Ventures, 2025 State of Generative AI in the Enterprise: https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/
- GitHub REST API rate limits: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- GitHub REST API search limits: https://docs.github.com/en/rest/search/search
- GitHub Trending: https://github.com/trending
- Hugging Face Hub API endpoints: https://huggingface.co/docs/hub/api
- Hacker News official API: https://github.com/HackerNews/API
- Product Hunt API docs: https://www.producthunt.com/v2/docs
- Reddit Developer Terms: https://redditinc.com/policies/developer-terms
- Reddit Data API Wiki: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- FTC Endorsement Guides FAQ: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
- Futurepedia: https://www.futurepedia.io/
