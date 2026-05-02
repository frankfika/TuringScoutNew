# 10 Development Plan

Canonical status: V1 development cycle and implementation plan.

Language: Chinese for product/developer execution.


## 1. 总体开发策略

TuringScout 不应该一开始就做成完整社区或 campaign 平台。开发顺序应该是：

```text
Manual useful leaderboard
  -> source registry and raw evidence pipeline
  -> admin review queue
  -> source/evidence/scoring automation
  -> optional submission/correction path
  -> social credit loop
  -> distribution and analytics
  -> creator/project profiles
  -> campaigns and monetization
```

核心原则：

- 先验证用户是否点击机会。
- 再验证自动化发现是否能稳定产出高质量机会。
- 再验证 scouts/creators 是否愿意纠错、解释、分享或选择性提交。
- 再验证项目方是否愿意纠错、转发、付费。
- 不要在没有信任和流量前做 token、wallet、复杂积分。
- 默认按单人运营设计：系统自动跑，founder 只审核异常和高价值项。

计划使用方式：

- M0-M5 是 V1 beta launch 路径；M1 只是内部可用切片，不等于最终 V1。
- M0-M3 先证明“证据可信 + 榜单可点击 + 管理员可审核”；M4 再把 scout/creator credit 放到前台；M5 只做上线质量和分发，不再扩 scope。
- 每个 milestone 结束都要过 phase gate。若核心指标不达标，优先修供给质量、解释质量、CTA、分类和数据新鲜度，不要提前做 V2/V3。
- Source registry、RawEvidence、Evidence、ScoreSnapshot 是数据底座，可以先建最小字段；UI、自动化和复杂队列分阶段补齐。
- 任何 wallet/token/airdrop/high-risk/sponsored 相关内容都必须人工审核，不能因为 AI 或分数高而自动上榜。


## 2. 推荐团队配置

最小团队：

- 1 product owner / founder
- 1 full-stack engineer
- 1 part-time designer 或使用现成 UI system
- 1 part-time ops/researcher，可由 founder 兼任

如果有 2 名工程师：

- Engineer A：public product + SEO + UI
- Engineer B：admin + data model + jobs + analytics


## 3. 技术栈假设

如果尚未定技术栈，推荐：

- Web: Next.js / React
- DB: Postgres
- ORM: Prisma / Drizzle
- Auth: admin only first，NextAuth/Supabase/Auth.js 均可
- Jobs: cron + queue，后续可换 worker
- AI extraction: provider-agnostic service wrapper
- Analytics: self-host events table first，后续接 PostHog/Umami
- Hosting: Vercel / Cloudflare Pages + managed Postgres

这不是强制要求。程序员可以按现有项目技术栈调整，但必须保留文档中的产品能力和数据关系。


## 4. 里程碑总览

| Milestone | 周期 | 目标 | 结果 |
| --- | ---: | --- | --- |
| M0 | 2-3 天 | 项目初始化与设计确认 | repo、基础 UI、数据库方案、seed 格式 |
| M1 | 1-2 周 | Manual Leaderboard MVP | 手动/seed 数据驱动的榜单可浏览可点击 |
| M2 | 1-2 周 | Source Registry + Admin Review | 来源登记、raw evidence intake、管理员审核发布 |
| M3 | 1-2 周 | AI Extraction + Scoring + GitHub | AI 抽取、证据、评分、GitHub enrichment 可用 |
| M4 | 1-2 周 | Optional Submission + Social Influence Loop V1 | 可选提交/纠错、Spotted by、creator content、Top Voices、分享卡 |
| M5 | 1 周 | Analytics + SEO + Beta Launch | 埋点、SEO、移动端、首批数据、beta 上线 |
| M6 | 2-4 周 | V1.5 Automation Hardening | 队列化自动化、digest、通知草稿、broken link cleanup |
| M7 | 4-6 周 | V2 Profiles + Attribution | creator profile、proof、adoptionshare 初版 |
| M8 | 6-8 周 | V3 Campaigns | 项目 campaign、creator 任务、付费模块 |
| M9 | 6-10 周 | V4 Intelligence/API | project dashboard、category intelligence、API/report 产品 |

建议先按 M0-M5 做 V1。

阶段门槛：

- M1 gate：陌生用户无需解释即可理解榜单，并完成 browse -> detail -> outbound click。
- M2 gate：founder 可以从 raw evidence/review queue 发布、拒绝、合并、下架机会。
- M3 gate：每个公开排名都有 score components、why ranked、evidence 和 risk rationale。
- M4 gate：creator/social proof 能被审核、展示和分享，但不混淆为官方来源。
- M5 gate：SEO、analytics、移动端、数据 QA 和高风险审核规则全部通过，才公开 beta。


## 5. M0：项目初始化与设计确认

周期：2-3 天。

目标：

- 让工程师可以开始稳定开发。

任务：

- 确认技术栈。
- 初始化 repo / app。
- 配置 lint/format/test/build。
- 建立基础 layout、导航、主题。
- 建立数据库连接。
- 创建初版 schema migration。
- 创建 seed 数据格式。
- 确认 admin 登录方式。
- 确认部署环境和 env vars。
- 确认 V1 scope freeze、P0/P1/P2 分界和 kill criteria。
- 为主要来源记录 allowed use / rate limit / commercial-use 注意事项。
- 配置 error logging、feature flag 或至少保留关闭 submit/AI/sponsored 的开关。

产出：

- App 可以本地启动。
- 首页 placeholder 可访问。
- DB migration 可跑。
- Seed script 可导入 sample projects/opportunities。

验收：

- `npm run dev` 或等价命令可启动。
- `npm run build` 或等价命令可通过。
- 数据库能创建至少 Project、Opportunity、Source、RawEvidence、Evidence 表。
- 程序员能根据 seed 格式导入一个带官方来源和 CTA 的机会。


## 6. M1：Manual Leaderboard MVP

周期：1-2 周。

目标：

- 不依赖复杂后台和 AI，先做出可以看的“AI 机会榜”。

用户价值：

- 用户能浏览榜单、看机会详情、点击官方链接。

功能范围：

- 首页。
- 分类榜单。
- 机会详情页。
- 项目详情页。
- 方法论页。
- 静态/seed 数据。
- 出站点击记录。

开发任务：

### Public UI

- 实现 `/` 首页。
- 实现 `/leaderboards/[category]`。
- 实现 `/opportunities/[slug]`。
- 实现 `/projects/[slug]`。
- 实现 `/methodology`。
- 实现 OpportunityCard 组件。
- 实现 label 组件：trust/risk/utility/commercial。
- 实现 empty/loading/error states。
- 移动端适配。

### Data

- 沿用 M0 的最小 schema，实现 Project、Opportunity、Source、RawEvidence、Evidence、ScoreSnapshot 的可读字段。
- Source/RawEvidence 在 M1 可先由 seed/script 写入，不需要完整后台 CRUD。
- ScoreSnapshot 可先存 manual score 和 whyRanked，不做复杂计算。
- Seed 20-40 个高质量项目/机会用于内部 MVP；公开 launch 的 50-100 个目标放到 M5 完成。
- 为每个 published listing 至少保留一条 RawEvidence。

### Tracking

- 实现 `outbound_click` API。
- CTA 点击先记录，再跳转。
- 记录 sourceModule、opportunityId、projectId、targetUrl。

验收：

- 用户从首页进入详情页再点击官方链接，全流程可用。
- 每个机会都显示 trust/risk/why ranked/source。
- 至少 3-4 个分类可访问，分类数量少但每类质量高。
- 移动端首屏可理解产品。

不做：

- 用户登录。
- 可选提交/纠错页。
- AI extraction。
- creator 排名。


## 7. M2：Source Registry + Admin Review

周期：1-2 周。

目标：

- 让系统不依赖用户提交也能接入来源、保存 raw evidence，并让管理员审核发布。
- 本阶段先做 source registry、手动/半自动 intake 和 review workflow；不要误解为已经完成大规模自动爬取。

用户价值：

- 榜单可以靠自动化/半自动化来源持续更新。
- 管理员只处理候选项和异常项，而不是手动找所有机会。

功能范围：

- Source registry。
- RawEvidence import/create。
- `/admin` dashboard。
- `/admin/review`。
- Admin 创建/编辑/发布 opportunities。

开发任务：

### Source Registry

- Source model。
- Source list/create/edit/enable/disable。
- 支持 sourceType、urlOrQuery、priority、frequency、fetchMethod、allowedUseNotes。
- 初始配置 GitHub/HN/Hugging Face/RSS/manual public sources。
- ProductHunt、Reddit 和社交平台先按 manual/submitted evidence 处理，除非已确认 API/条款允许。

### Raw Evidence Flow

- 手动导入 URL 创建 RawEvidence。
- 可先做一个低风险 source 的 scheduled import pilot；其余来源仍可人工导入。
- 后续 cron/agent 可从 Source 生成 RawEvidence，但不是 M2 必须完成的大规模能力。
- RawEvidence 保存 sourceUrl、rawTitle、rawTextExcerpt、linkedUrls、checksum、fetchStatus。
- RawEvidence 可转成 Project/Opportunity draft。

### Admin Auth

- AdminUser model。
- admin-only middleware。
- 登录/登出。

### Review Queue

- Candidate/RawEvidence 列表。
- 筛选：source/status/risk/type。
- 查看 evidence 详情。
- 一键创建 Project/Opportunity 草稿。
- approve/reject/merge。
- 添加 reviewReason。

### Opportunity Admin

- opportunity list。
- opportunity edit form。
- status 修改。
- trust/risk labels 修改。
- source/evidence 管理。

验收：

- 管理员能从 RawEvidence/candidate 发布一个 opportunity。
- rejected/ignored evidence 不在前台显示。
- high-risk 类型默认进入 needs_review。
- 每个 published opportunity 都能追溯到至少一条 official/source evidence。

不做：

- 复杂自动 AI 抽取。
- 复杂 duplicate detection。
- creator profile。


## 8. M3：AI Extraction + Scoring + GitHub Enrichment

周期：1-2 周。

目标：

- 让榜单不只是手动排序，而是有可解释的 evidence/scoring。
- 建立后续自动化、归因、报告所需的数据底座。

用户价值：

- 用户知道为什么上榜。
- 管理员可以根据 score、risk 和 evidence 更快审核。

功能范围：

- Evidence 管理。
- AI extraction from RawEvidence。
- 至少一个 production-safe scheduled source job，用来验证 Source -> RawEvidence -> AI extraction -> review queue 闭环。
- Entity resolution / dedupe 初版。
- Score components。
- GitHub metrics。
- Scoring recalculation。
- Review triggers。

开发任务：

### AI Extraction From RawEvidence

- 建立最小 scheduled job：从 1 个高信号、低条款风险来源写入 RawEvidence，并触发 extraction draft。
- 从 RawEvidence 生成 ProjectCandidate / OpportunityCandidate。
- 提取 project name、official URL、GitHub URL、reward、task steps、difficulty、estimated time、risk notes。
- 保存 extraction confidence。
- low-confidence 进入 review queue。
- AI 只能生成草稿和建议，不直接发布 high-risk、sponsored 或 homepage top placement。

### Evidence

- Evidence model 完整实现。
- Evidence 关联 RawEvidence。
- Opportunity detail 显示 official sources 和 evidence。
- Admin 可添加/编辑/隐藏 evidence。

### Entity Resolution

- 按 domain、GitHub URL、normalized name 做确定性 dedupe。
- ambiguous duplicate 进入 review queue。
- Admin 可 merge project/opportunity。

### GitHub Enrichment

- 输入 GitHub URL。
- 获取 repo name、stars、forks、open issues、last pushed、description、topics。
- 保存 GithubMetricSnapshot。
- rate limit 和 error handling。
- UI 显示 GitHub metrics。

### Scoring

- 实现 opportunity_score 初版。
- components 存入 ScoreSnapshot。
- admin 可手动 override score/whyRanked。
- score recalculation endpoint。
- social proof、clicks、submissions 只能作为 capped signal，不能压过 official evidence、freshness 和 risk。
- 分开存储 organic score、admin override 和 sponsored/featured 状态，避免商业位污染自然榜。

### Review Triggers

- wallet/token/airdrop/high risk -> needs_review。
- missing official source -> needs_review。
- sponsored -> needs_review。
- homepage top placement -> needs_review。

验收：

- Admin 可以看到 RawEvidence、Evidence、score components、risk reason。
- 前台显示 why ranked。
- GitHub-linked 项目显示 metrics。
- stale/broken evidence 可以标记。
- 重复项目/机会可以被合并或进入 review。
- 至少一个 scheduled source job 能生成 reviewable candidate；其它来源可继续 manual/import。

不做：

- 大规模 web crawling。
- 全社交平台 API 接入。


## 9. M4：Optional Submission + Social Influence Loop V1

周期：1-2 周。

目标：

- 把 TuringScout 从“机会榜”升级为“机会榜 + Scout/Creator 影响力机制”。
- 提供可选提交/纠错入口，但不让提交成为系统运行前提。
- V1 不做登录身份系统；creator/scout 先以 handle、content URL、contactEmail 和管理员审核记录表示。

用户价值：

- Creator/Scout 有动力纠错、解释、分享或选择性提交。
- 项目方能看到是谁帮自己获得关注。

功能范围：

- `/submit` optional submit/correction page。
- Creator model。
- CreatorContent model。
- `Spotted by` / `Explained by` / `Validated by`。
- `/scouts` 页面。
- Opportunity detail creator module。
- Project page creator module。
- Share cards 初版。

开发任务：

### Creator Data

- Creator model。
- CreatorContent model。
- ProjectAcknowledgement model。
- Submission 可关联 CreatorContent。
- Admin 可 approve/reject creator content。

### Optional Submit / Correction Flow

- 提交表单支持 URL、type、note、contactEmail、socialHandle、contentUrl、publicCreditOptIn。
- URL 基础校验。
- Rate limit/honeypot。
- 创建 Submission 记录。
- Submission 进入 admin review，不自动发布。

### Public Credit

- OpportunityCard 显示 spottedBy。
- Opportunity detail 显示 Scout credits。
- Detail 显示 Useful creator context。
- Project page 显示 Top scouts / Top voices。
- Public credit 只代表“帮助发现/解释/纠错”，不代表官方背书、奖励资格或收益承诺。

### Scouts Page

- `/scouts` 页面。
- 展示本周 Top AI Scouts / Top Voices。
- V1 可由 admin 手动选择。

### Share Cards

- 生成或渲染 share card 页面/图片。
- 包含 project、opportunity、rank、labels、spotted by。
- 支持复制链接或下载图片，具体形式按开发成本决定。

验收：

- 没有用户提交时，系统仍可通过 Source/RawEvidence/AI extraction 持续发布候选机会。
- 一个 creator content 从提交到审核到前台 credit 全流程可用。
- Official source 和 creator content 分开展示。
- paid/sponsored creator content 必须有明确标签。
- `/scouts` 页面可展示 curated list。
- Share card 可以被项目方/creator 转发。

不做：

- 自动 creator score 排名。
- 钱包奖励。
- campaign marketplace。


## 10. M5：Analytics + SEO + Beta Launch

周期：1 周。

目标：

- 达到可公开 beta 的质量。
- M5 不新增核心产品能力，只做 launch hardening、数据 QA、SEO、analytics、首批运营和修 P0 bug。

功能范围：

- 关键 analytics。
- SEO meta。
- 移动端 polish。
- QA。
- 首批数据。
- 基础运营 dashboard。

开发任务：

### Analytics

- `leaderboard_view`
- `opportunity_impression`
- `opportunity_detail_view`
- `outbound_click`
- `filter_apply`
- `submit_url`
- `submit_social_proof`
- `share_card_click`
- `creator_credit_view`
- `subscribe_submit`
- `report_issue`
- `admin_decision`

### SEO

- title/meta/canonical。
- OG tags。
- sitemap。
- robots。
- category/detail/project SEO。

### QA

- 检查移动端。
- 检查 404/empty/error。
- 检查 CTA 跳转。
- 检查 high risk 不误上榜。
- 检查 sponsored label。
- 检查 private email/contact 不出现在前台。
- 检查每个 published opportunity 都有 source、CTA、status、freshness 和 risk note。

### Seed

- 50-100 projects。
- 60+ opportunities。
- 20+ creator/social proof。
- 5+ scouts/top voices。

验收：

- V1 Launch Checklist 全部通过。
- Founder 可以每天用 admin 完成审核。
- 首批用户可以无登录完成浏览和出站点击。
- 若 social loop 仍不稳定，可以小范围 beta，但不能把缺失 creator proof 的内容包装成 verified social proof。


## 11. M6：V1.5 Automation

周期：2-4 周。

目标：

- 降低日常运营成本，让榜单和社交传播更稳定。
- 注意：M2/M3 已经有 source registry 和 AI extraction 初版；M6 不是重做，而是把它们队列化、规模化、可观测化。

功能：

- Source registry driven discovery health。
- Queue-based agent workflow。
- AI extraction batch processing。
- AI summary/tags/risk labels quality review。
- Duplicate suggestion。
- Broken/expired link checker。
- Weekly report draft。
- Creator/project notification drafts。
- Founder daily dashboard。

开发任务：

- Source registry health/status UI。
- Discovery queue。
- Raw evidence queue。
- Fetch URL content。
- Clean/extract page text。
- AI extraction batch runner。
- 保存 extracted fields。
- Admin diff view：AI 提取结果 vs 当前字段。
- Duplicate suggestion queue。
- Risk review queue。
- Broken link cron。
- Expiration decay。
- Source failure/rate-limit monitoring。
- Digest draft generator。
- Project notification draft。
- Creator recognition draft。

验收：

- 60%+ low-risk source candidates/submissions 可生成可用草稿。
- 每日人工工作量下降。
- 每周 report 80% 可由系统生成草稿。


## 12. M7：V2 Profiles + Attribution

周期：4-6 周。

目标：

- 从轻量 credit 进入可积累身份和 attribution。

功能：

- Creator/scout login。
- Creator profile。
- Saved opportunities。
- Completed/attempted status。
- Proof link submission。
- Project claim flow。
- Adoptionshare v1。
- Project basic report。

开发任务：

- Public user auth。
- User/Creator account linking。
- Profile pages。
- Proof submission and review。
- Saved/completed models。
- Attribution events。
- Project claim verification。
- Report dashboard。

验收：

- Creator 可以认领自己的历史贡献。
- Project 可以看到基础 report。
- Attribution 文案使用 correlated lift，不做过度归因。


## 13. M8：V3 Campaigns

周期：6-8 周。

目标：

- 项目方可以发起真实 adoption campaign，而不是 fake engagement。

Campaign 类型：

- Mindshare：高质量解释和讨论。
- Buildshare：issue、PR、docs、example、MCP integration。
- Usageshare：API trial、agent session、workflow。
- Creatorshare：tutorial、benchmark、comparison、video。
- Referralshare：qualified developers/teams/creators。

功能：

- Campaign create/review。
- Creator eligibility。
- Task brief。
- Proof submission。
- Quality review。
- Reward/payment manual-first。
- Sponsored disclosure。

验收：

- 所有 campaign 都清楚标记 sponsored/paid。
- 不保证 GitHub stars/airdrops/reviews。
- 质量审核优先于数量。


## 14. M9：V4 Intelligence/API

周期：6-10 周。

目标：

- 把积累的数据产品化，面向项目方、DevRel、投资人和 AI agents 提供 intelligence。

功能：

- Project dashboard。
- Category trend report。
- Competitor comparison。
- Creator/builder impact report。
- Campaign attribution report。
- API access。

开发任务：

- Report data marts。
- Project dashboard charts。
- Category ranking history。
- Creator contribution analytics。
- Exportable PDF/CSV/report。
- API key model。
- Public/private API endpoints。

验收：

- 项目方可以看到 clicks、rank movement、creator coverage、source evidence、recommended next campaign。
- Admin 可以生成一份项目 report。
- API 返回结构化 project/opportunity/category 数据。


## 15. 逻辑校验清单

每周 planning/review 时按以下清单检查，避免路线跑偏：

- 是否把“AI 工具目录”误做成了机会榜？如果机会没有明确 action、source、effort、risk、CTA，就不要发布。
- 是否把“用户提交”变成了供给主路径？如果是，先补 source registry 和 raw evidence pipeline。
- 是否让 social proof 影响排名过重？creator/scout credit 应该促进解释和传播，但不能替代官方证据。
- 是否过早做账号、积分、钱包、campaign？除非 V1 点击、项目回应、creator 分享已有信号，否则后置。
- 是否所有高风险、奖励、airdrop、wallet、sponsored、homepage top placement 都进入人工审核？
- 是否每个 milestone 都减少一个核心风险：需求风险、供给风险、信任风险、运营风险、增长风险或商业化风险？


## 16. Epic Backlog

### E1 Public Leaderboards

User story:

> 作为用户，我希望无需登录就能看到今天值得尝试的 AI 机会。

Tasks:

- OpportunityCard。
- Home leaderboard。
- Category leaderboard。
- Filters。
- Detail page。
- Project page。
- CTA tracking。

Acceptance:

- 用户可完成 browse -> detail -> outbound click。


### E2 Evidence And Trust

User story:

> 作为用户，我希望知道一个机会的来源、风险和可信度。

Tasks:

- Evidence model。
- Source display。
- Trust labels。
- Risk labels。
- Methodology page。
- Report issue。

Acceptance:

- 每个 published opportunity 都有 source、trust、risk。


### E3 Submission And Review

User story:

> 作为项目方或 scout，我希望可以选择性提交 URL、纠错或申请 credit，并被平台审核。

Tasks:

- Optional submit/correction page。
- Submission model。
- Admin review queue。
- Approve/reject/merge。
- Draft project/opportunity creation。

Acceptance:

- 提交到发布闭环可用。


### E4 Social Influence Loop

User story:

> 作为 creator/scout，我希望我的发现和解释被公开 credit。

Tasks:

- Creator model。
- CreatorContent model。
- Public credit labels。
- Scouts page。
- Share cards。
- Project acknowledgement。

Acceptance:

- Creator content 审核后可在机会/项目页展示。


### E5 Scoring And Ranking

User story:

> 作为用户，我希望榜单排名有解释，而不是黑箱。

Tasks:

- ScoreSnapshot。
- Opportunity score formula。
- Creator score formula/manual score。
- Why ranked。
- Ranking recalculation。

Acceptance:

- Admin 能看到 score components，用户能看到 why ranked。


### E6 Analytics And Ops

User story:

> 作为 founder，我希望知道哪些机会、分类和 creator 真的带来点击和提交。

Tasks:

- Event API。
- Analytics table。
- Admin dashboard。
- CTR metrics。
- Review queue metrics。

Acceptance:

- 可以查看 outbound clicks、submissions、review queue。


### E7 Automation

User story:

> 作为运营者，我希望 AI 自动提取和生成草稿，减少人工工作。

Tasks:

- URL fetcher。
- AI extraction。
- AI summary。
- Risk classifier。
- Duplicate suggestion。
- Digest draft。

Acceptance:

- low-risk source candidates and optional submissions generate reviewable drafts.


## 17. 开发顺序建议

如果只有 1 个工程师：

1. Data schema + API contract。
2. Seed script + raw evidence sample。
3. Public pages。
4. Outbound tracking。
5. Source registry / raw evidence import。
6. Admin review。
7. Evidence/scoring/GitHub enrichment。
8. AI extraction draft flow。
9. Optional submit/correction form。
10. Creator/social proof/share cards。
11. SEO/analytics/launch QA。
12. Automation hardening。

如果有 2 个工程师：

- Engineer A:
  - public pages
  - UI components
  - SEO
  - share cards

- Engineer B:
  - schema
  - admin
  - API
  - analytics
  - jobs

先合并 schema 和 API contract，再并行开发。


## 18. 测试计划

### Unit / Logic Tests

- score formula。
- URL validation。
- status transition。
- review trigger rules。
- label rendering。

### Integration Tests

- submit -> admin review -> publish -> public display。
- outbound click event -> redirect。
- creator content -> approve -> detail page credit。
- project merge。
- expired opportunity hidden from leaderboard。
- RawEvidence -> AI extraction -> review queue -> publish。
- high-risk/sponsored content -> needs_review -> no organic top placement before approval。

### Manual QA

- 首页移动端。
- 分类筛选。
- 详情页 CTA。
- Admin 审核。
- Sponsored label。
- High-risk label。
- SEO meta。

### Data QA

- published opportunity 必须有 source。
- published opportunity 必须有 CTA。
- creator content 必须有 status。
- private email 不出现在前台。
- sponsored content 必须标记。
- score snapshot 必须能解释 why ranked。
- official sources 和 creator/social proof 必须分开显示。
- stale/expired/broken evidence 必须能被标记或降权。


## 19. 上线前 7 天执行表

### D-7

- Freeze V1 scope。
- 只允许修 P0 bug、数据质量和 launch copy，不再新增核心功能。
- Seed 30 projects。
- Admin review usable。

### D-6

- Seed 60 opportunities。
- 检查 trust/risk labels。
- 检查 CTA。

### D-5

- 加入 10-20 creator/social proof。
- 生成 `/scouts` 初版。

### D-4

- 移动端 QA。
- SEO QA。
- Analytics QA。

### D-3

- 小范围发给 5-10 个朋友/creator 测试。
- 收集反馈。
- 修高优 bug。

### D-2

- 联系 10-20 个项目方，准备 ranking/correction message。
- 准备第一篇 weekly digest。

### D-1

- Final seed review。
- 备份数据库。
- 检查 admin 权限。
- 检查 error logging。

### Launch Day

- 发布首页和榜单。
- 分享 Top 5 opportunities。
- 给 credited creators 发 share card。
- 给 ranked projects 发 correction/update link。
- 观察 clicks、source candidates、optional submissions/corrections、errors。
- 当天不改 scoring 大逻辑；只修明显 bug 和高风险误展示。


## 20. V1 成功标准

7 天内：

- 500+ unique visitors，或在小范围 beta 中达到事先定义的 100-200 高相关访客目标。
- leaderboard -> detail CTR >= 15%，定义为 `opportunity_detail_view / opportunity_impression`。
- detail -> outbound CTR >= 20%，定义为 `outbound_click / opportunity_detail_view`。
- 10+ valid corrections/reports/optional submissions, or equivalent admin-discovered updates.
- 5+ creator/social proof shares, corrections, or optional submissions.
- 3+ projects respond/correct/repost。
- review queue 可控。
- 若流量未达标但 CTR、项目回应、creator 分享强，优先补分发；若流量达标但 CTR 弱，先修供给质量和页面解释，不要扩功能。

30 天内：

- 100-300 valid opportunities/projects indexed。
- weekly report 可稳定发布。
- 20+ approved creator contributions。
- 10+ project-side interactions。
- 至少 1 个 sponsored/featured/report 意向。
- founder 日常审核时间控制在 20-45 分钟内；若超过，优先做 M6 automation hardening。


## 21. 持续优化节奏

每周固定一次 45-60 分钟 planning review：

1. 看数据：traffic、detail CTR、outbound CTR、top categories、submission/correction、creator share、project response、review workload。
2. 看质量：随机抽 10 个机会，检查 source、risk、why ranked、CTA、freshness、creator proof 是否准确。
3. 看风险：检查 high-risk/sponsored/airdrop/wallet 是否有漏审，检查是否有 misleading copy。
4. 决策：只选 1 个 supply 改进、1 个 UX 改进、1 个 ops 自动化改进进入下一周。
5. 更新文档：把已验证的假设写入 PRD/engineering spec，把失败假设移到 archive 或标记为后置。

每两周做一次 scope review：

- 如果用户点击弱：优先改分类、卡片信息密度、why ranked、CTA 和机会质量。
- 如果供给弱：优先扩 high-signal sources、改善 AI extraction 和 review queue。
- 如果 creator 参与弱：优先增强 credit 展示、share card、outreach message。
- 如果项目方回应弱：优先补 project page、traffic proof、correction/update link。
- 如果运营太重：优先做 queue、dedupe、broken link、digest draft，不做新前台功能。


## 22. 程序员交付清单

每个 milestone 结束时交付：

- 已完成页面列表。
- 已完成 API 列表。
- schema migration。
- seed 或测试数据。
- 关键截图或本地 URL。
- 已知问题。
- 未完成项。
- 下一阶段建议。

每次上线前确认：

- build pass。
- migration run。
- admin login works。
- published data visible。
- private data hidden。
- event tracking works。
- rollback plan exists。
