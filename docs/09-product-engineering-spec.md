# 09 Product Engineering Spec

Canonical status: V1 engineering handoff spec.

Language: Chinese for product/developer execution.


## 1. 文档目标

这份文档给程序员使用，目标是把 TuringScout V1 从概念拆成可开发的页面、数据表、接口、状态流、评分规则、后台能力和验收标准。

一句话产品：

> TuringScout = AI 机会榜 + AI Scout 影响力榜。每天发现值得试的 AI 项目，也让最早发现、解释和验证这些机会的 Scout / 创作者被看见。

V1 最小可上线形态：

- 用户不用登录，可以浏览 AI 机会榜。
- 系统主要靠 source registry、手动/半自动 intake、至少一个 production-safe scheduled source job、AI extraction draft 和 admin review 运行，不依赖用户提交。
- 每个机会都有来源、收益、难度、风险、为什么上榜和官方 CTA。
- Scout / Creator 可以选择性提交机会、纠错或内容链接，并获得 `Spotted by` / `Explained by` / `Validated by` 等公开 credit。
- 管理员可以审核、编辑、合并、发布、下架机会和 creator content。
- 系统可以追踪曝光、详情页访问、出站点击、提交、分享等关键事件。
- 系统保留 raw evidence、score components、risk rationale，为后续 attribution、reports 和 campaigns 做数据基础。


## 2. V1 产品边界

### 自动化运行原则

- Source registry 是主要输入。
- V1 beta 先做手动/半自动 source intake，并至少验证一个安全的 scheduled source job。
- Scheduled jobs / agents 负责发现、抓取、抽取、去重、评分、风控和生成草稿；V1 默认不要求大规模 crawling。
- AI 只能生成草稿、摘要、风险建议和 score components；敏感项不能由 AI 直接发布。
- Admin 只处理高价值、高风险、低置信度、重复冲突、首页 Top、sponsored/featured 项。
- Submit/correction 是可选入口，不是增长或供给的前提。
- 目标是单人可运营：V1 每天 20-45 分钟，V1.5 每天 10-20 分钟。
- 低风险自动发布可以作为 feature flag 后置；wallet/token/airdrop/high-risk/sponsored/homepage top placement 永远需要人工审核。

### 实施阶段边界

- M0-M5 是 V1 beta launch 路径；M1 是内部 manual/seed leaderboard，不等于完整 V1。
- M2 做 source registry、raw evidence intake 和 admin review，不等于完成大规模自动发现。
- M3 做 AI extraction、scoring、GitHub enrichment 和至少一个 scheduled source job 闭环。
- M4 做 optional submission、creator/social proof、`/scouts` 和 share cards。
- M5 只做 analytics、SEO、移动端、数据 QA 和 launch hardening，不再新增核心功能。
- M6/V1.5 再做 queue-based automation hardening、source health、batch extraction、digest 和 notification drafts。

### 必须做

- 首页机会榜
- 分类榜单
- 机会详情页
- 项目详情页
- Source registry
- Raw evidence store
- 至少一个 production-safe scheduled source job
- AI extraction draft flow
- ScoreSnapshot / whyRanked / risk rationale
- Admin review queue
- 可选提交/纠错页
- 方法论/规则页
- Scout / Top Voices 轻量展示
- Admin 审核后台
- 出站点击追踪
- 核心 analytics events
- 基础分享卡片
- 基础 SEO

### 可以半自动/人工

- 首批项目和机会 seed
- Top Scouts / Top Voices 周榜
- 项目通知文案
- Creator 通知文案
- AI 生成摘要和标签后的人工修正
- 可选提交内容的审核

### V1 不做

- 钱包
- token
- 自动奖励发放
- DAO 治理
- 全量社交平台爬虫
- 大规模无差别 web crawling
- 复杂用户社区
- Public user login / saved opportunities
- Creator/scout profile
- 自动 creator 排名或争议处理
- creator 自动结算
- 项目方完整自助广告系统
- high-risk、sponsored、wallet/token、speculative reward、homepage top placement 的默认自动发布


## 3. 用户角色

### Public Visitor

未登录用户。

权限：

- 浏览首页、分类、机会详情、项目详情、方法论页。
- 点击官方链接。
- 可选提交 URL。
- 可选提交风险报告/纠错。
- 订阅 newsletter。

### Scout / Creator

V1 可不登录，用提交表单里的 public handle 表示身份。提交不是必须行为，只是 credit/correction 入口。

权限：

- 可选提交机会 URL。
- 可选提交自己或他人的内容链接。
- 选择是否公开显示 handle。
- 被管理员审核后展示为 `Spotted by` / `Explained by` / `Validated by`。

V2 再做正式账号和 profile。

### Project / DevRel

V1 可不登录，用提交表单提交官方链接或纠错。项目不提交也应该能被系统从公开来源发现。

权限：

- 提交项目/机会官方 URL。
- 提交 correction。
- 表达 featured / sponsored interest。

### Admin

后台管理员。

权限：

- 管理项目、机会、证据、提交、creator content。
- 审核、编辑、发布、拒绝、过期、合并。
- 调整评分和标签。
- 标记 sponsored/featured。
- 查看基础 analytics。


## 4. 信息架构与路由

### Public Routes

| Route | 页面 | 目的 |
| --- | --- | --- |
| `/` | 首页 | 展示今日最值得尝试的 AI 机会和核心解释。 |
| `/leaderboards` | 榜单总览 | 展示所有分类入口。 |
| `/leaderboards/[category]` | 分类榜单 | 展示某个类别的机会榜。 |
| `/opportunities/[slug]` | 机会详情 | 帮用户判断是否要行动。 |
| `/projects/[slug]` | 项目详情 | 聚合项目、机会、证据、creator 内容。 |
| `/scouts` | Scout / Top Voices | 展示本周人工/半自动 curated 的 scouts/creators。 |
| `/submit` | 可选提交/纠错页 | 提交机会、项目、内容、纠错、风险报告；不是系统运行依赖。 |
| `/methodology` | 方法论页 | 说明排名、AI、审核、风险、赞助规则。 |
| `/weekly/[date]` | 周榜归档 | V1.5，可后置。 |

### Admin Routes

| Route | 页面 | 目的 |
| --- | --- | --- |
| `/admin` | Admin 首页 | 每日工作台。 |
| `/admin/review` | 审核队列 | 审核需要人工处理的项目。 |
| `/admin/opportunities` | 机会管理 | 列表、搜索、编辑、发布、过期。 |
| `/admin/projects` | 项目管理 | 项目 profile、合并、标签、官方链接。 |
| `/admin/submissions` | 提交管理 | 用户/项目/creator 提交记录。 |
| `/admin/creators` | Creator 内容管理 | 审核 social proof、credit、质量评分。 |
| `/admin/evidence` | 证据管理 | 查看和编辑 source/evidence。 |
| `/admin/analytics` | 数据面板 | 出站点击、提交、分享、榜单表现。 |
| `/admin/settings` | 设置 | 分类、标签、权重、feature flag。 |


## 5. 页面规格

### 5.1 首页 `/`

目标：

- 让新用户 30 秒内理解产品、找到一个机会并点击。
- 让 creator/scout 看到可以被 credit。
- 让项目方看到可以被自动发现，也可以选择性补充或纠错官方信息。

模块：

1. Hero
   - 标题：`AI 机会榜 + AI Scout 影响力榜`
   - 副标题：`每天发现值得试的 AI 项目，看收益、看难度、看来源、看风险。`
   - CTA：`Explore opportunities` / `Submit correction or proof`

2. Today's Top AI Opportunities
   - 默认展示 10 条。
   - 卡片必须包含：项目名、机会 hook、reward/upside、time、difficulty、trust、risk、why ranked、spotted by、CTA。

3. Quick Filters
   - Free Credits
   - Agent Trial
   - GitHub
   - MCP
   - Bounty
   - No Login
   - 5 Min
   - Verified
   - Ending Soon

4. Spotted by AI Scouts / Top Voices
   - 展示 3-5 个本周 creator/scout。
   - 每个显示 handle、贡献类型、关联机会。

5. Category Previews
   - Open-Source AI Momentum
   - AI Agents / MCP Tools
   - Free AI Credits / Trials
   - AI Bounties / Builder Tasks

6. Optional correction / submit CTA
   - 文案：`发现好机会或错误？可以提交线索、纠错或内容，被标记为 Spotted by。`

7. Subscribe CTA
   - email 输入。

验收：

- 首页无需登录。
- Top 10 每张卡有官方 CTA。
- 点击 CTA 先记录事件再跳转。
- 移动端首屏能看到产品定位和至少一条机会。


### 5.2 分类榜单 `/leaderboards/[category]`

目标：

- 按明确 intent 浏览机会。

首批分类：

- `open-source-ai`
- `ai-agents-mcp`
- `free-credits-trials`
- `bounties-builder-tasks`

可后置或 manual-only 分类：

- `possible-airdrops-points`，只人工审核后展示，不进入自动发布。
- `rag-tools`
- `ai-devtools`
- `creator-tasks`
- `integration-challenges`

页面模块：

- 分类标题和解释。
- 当前分类的排名方法说明。
- Filter bar。
- Ranked cards。
- Last updated。
- Source/risk legend。
- Optional correction / submit related opportunity CTA。

验收：

- URL 可被 SEO 收录。
- 每个分类有独立 title/description。
- 列表支持分页或 load more。
- 空状态要解释系统正在自动发现，也可以选择性提交线索或纠错。


### 5.3 机会详情 `/opportunities/[slug]`

目标：

- 帮用户判断是否值得行动。

必须回答：

1. 这是什么？
2. 我能获得什么？
3. 我要做什么？
4. 需要多久？
5. 来源是否官方？
6. 风险是什么？
7. 下一步去哪里？

页面模块：

- Header：项目名、机会标题、状态、标签。
- Primary CTA：官方链接。
- Summary：AI 摘要，标注 AI Summary。
- Reward / Upside。
- Steps：任务步骤。
- Effort：时间、难度、是否需登录、是否需钱包。
- Official Sources：官网、docs、GitHub、活动页。
- Why Ranked：上榜原因。
- Risk Notes：风险说明。
- Scout Credits：`Spotted by`。
- Useful Creator Context：creator 文章、视频、教程、benchmark。
- Project Acknowledgement：项目方转发/回复/确认。
- Similar Opportunities。
- Report / Submit Update。

验收：

- 官方来源和 creator 内容必须分开展示。
- 高风险或 speculative reward 必须显示 `Reward Not Guaranteed`。
- CTA 点击必须记录 `outbound_click`。
- 过期机会显示 expired，不进入普通 Top 榜。


### 5.4 项目页 `/projects/[slug]`

目标：

- 展示一个 AI 项目的机会、证据、社会影响和 adoption 线索。

模块：

- Project summary。
- Official links。
- GitHub metrics，如果有。
- Active opportunities。
- Ranking appearances。
- Top scouts。
- Top voices。
- Useful creator content。
- Source evidence。
- Risk/credibility notes。
- Similar projects。
- Submit correction CTA。

验收：

- 一个项目可关联多个 opportunities。
- 合并重复项目后 old slug 可 redirect。
- 项目页不能暗示 sponsored 会提升 organic rank。


### 5.5 Scouts 页面 `/scouts`

V1 可以手动 curated。

目标：

- 让 creator/scout 看见自己有机会被展示。
- 形成早期社交传播。

模块：

- 本周 Top AI Scouts。
- 本周 Top Voices。
- 贡献类型说明。
- 如何被收录。
- Optional submit/correction/content CTA。

卡片字段：

- display handle
- avatar 可选
- contribution type
- linked project/opportunity
- reason for recognition
- content URL 可选

验收：

- 不展示私人 email。
- paid creator content 必须标记。
- 排行逻辑可以先人工，但页面要有方法论说明。


### 5.6 可选提交/纠错页 `/submit`

定位：

- 自动发现是主线，提交只是补充。
- 用户不提交，系统也应该可以通过 Source/RawEvidence/AI draft/admin review 持续生成候选、审核并发布。

提交类型：

- project
- opportunity
- free credits
- GitHub repo
- agent
- bounty
- creator content
- correction
- risk report
- sponsored/featured interest

必填：

- URL
- type

选填：

- note
- contact email
- social handle
- content/post URL
- project name
- public credit preference
- budget/featured interest

提交后状态：

- `received`
- `extracted`
- `needs_review`
- `published`
- `rejected`
- `merged`

验收：

- 提交成功后显示 confirmation。
- URL 做基础校验。
- spam honeypot 或 rate limit。
- 不需要登录。


### 5.7 方法论页 `/methodology`

必须解释：

- 排名逻辑。
- AI 做什么，不做什么。
- 人工审核触发条件。
- trust/risk/utility/commercial labels。
- sponsored policy。
- creator/scout credit policy。
- V1 limitations。
- report/update flow。

验收：

- 说明 organic ranking cannot be bought。
- 说明 sponsored/featured 必须标记。
- 说明不保证 airdrop/reward/stars。


## 6. 数据模型

字段类型可按具体技术栈调整。以下是逻辑模型。

Source policy:

- GitHub、官方网站/docs/blog、Hugging Face、HN、RSS/public pages 是 V1 优先来源。
- ProductHunt、Reddit、X/Twitter、WeChat、Zhihu、Bilibili、小红书、Jike、Discord/Telegram 等来源在 V1 先按 manual/submitted evidence 处理，除非已确认 API、条款、rate limit 和商业使用许可。
- 每个 Source 必须记录 allowedUseNotes；如果来源条款不清楚，默认 `fetchMethod=manual` 或 `submitted_only`。
- Source registry 不是“全网爬虫许可”。任何来源失败、被限制或条款不明确时，应降级为人工导入或提交链接。

### 6.0 Source

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| name | string | yes | source name or query name |
| sourceType | enum | yes | github/website/docs/blog/rss/hn/producthunt/reddit/huggingface/social/manual/submission |
| urlOrQuery | string | yes | URL, RSS URL, API endpoint, or query template |
| categoryHint | string | no | mapped category |
| priority | enum | yes | high/medium/low |
| frequency | enum | yes | daily/weekly/manual/submitted_only |
| fetchMethod | enum | yes | api/rss/public_page/manual/submitted_only |
| allowedUseNotes | text | no | terms/rate/commercial notes |
| enabled | boolean | yes | default true |
| lastCheckedAt | datetime | no | |
| createdAt | datetime | yes | |
| updatedAt | datetime | yes | |

### 6.1 RawEvidence

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| sourceId | string | no | FK Source |
| sourceType | enum | yes | |
| sourceName | string | no | |
| sourceUrl | url | yes | |
| discoveredAt | datetime | yes | |
| fetchedAt | datetime | no | |
| rawTitle | string | no | |
| rawTextExcerpt | text | no | |
| rawContentRef | string | no | pointer/path if storing full HTML/JSON separately |
| authorOrAccount | string | no | |
| publishedAt | datetime | no | |
| linkedUrls | json | no | |
| language | string | no | |
| fetchStatus | enum | yes | pending/success/failed/blocked |
| checksum | string | no | dedupe/reprocess |
| createdAt | datetime | yes | |

### 6.2 Project

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | primary key |
| slug | string | yes | unique |
| name | string | yes | |
| tagline | string | no | 一句话 |
| summary | text | no | AI/human summary |
| category | string | no | primary category |
| tags | string[] | no | |
| officialWebsiteUrl | url | no | |
| githubUrl | url | no | |
| docsUrl | url | no | |
| blogUrl | url | no | |
| huggingFaceUrl | url | no | |
| productHuntUrl | url | no | |
| logoUrl | url | no | |
| trustLabel | enum | yes | official/verified/unverified/ai_summary |
| riskLabels | enum[] | no | |
| status | enum | yes | draft/published/hidden/archived |
| lastCheckedAt | datetime | no | |
| createdAt | datetime | yes | |
| updatedAt | datetime | yes | |

Indexes:

- unique `slug`
- index `status`
- index `category`
- search index `name`, `summary`, `tags`


### 6.3 Opportunity

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| projectId | string | yes | FK Project |
| slug | string | yes | unique |
| title | string | yes | opportunity hook |
| summary | text | no | |
| opportunityType | enum | yes | free_credit/agent_trial/github/bounty/early_access/mcp/points_airdrop/other |
| rewardType | enum | no | free_credits/points/bounty/access/github_momentum/learning/unknown |
| rewardDescription | text | no | |
| taskSteps | json/text | no | ordered steps |
| estimatedMinutes | number | no | |
| difficulty | enum | no | beginner/intermediate/advanced |
| requiresLogin | boolean | no | |
| requiresWallet | boolean | no | |
| primaryCtaUrl | url | yes | |
| primaryCtaLabel | string | yes | |
| trustLabel | enum | yes | official_source/verified/unverified/ai_summary |
| riskLabels | enum[] | no | |
| utilityLabels | enum[] | no | no_login/5_min/beginner_friendly/builder_task/ending_soon |
| commercialLabel | enum | no | sponsored/featured/partner_campaign |
| sourceConfidence | number | no | 0-100 |
| organicScore | number | no | |
| adminScoreOverride | number | no | separate from organic score |
| adminOverrideReason | text | no | required when override affects ranking |
| whyRanked | text | no | public explanation |
| status | enum | yes | draft/needs_review/published/expired/rejected/archived |
| reviewReason | text | no | |
| expiresAt | datetime | no | |
| lastCheckedAt | datetime | no | |
| createdAt | datetime | yes | |
| updatedAt | datetime | yes | |

Indexes:

- unique `slug`
- index `projectId`
- index `status`
- index `opportunityType`
- index `organicScore`
- index `expiresAt`


### 6.4 Evidence

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| projectId | string | no | |
| opportunityId | string | no | |
| rawEvidenceId | string | no | FK RawEvidence |
| sourceType | enum | yes | official_site/github/docs/blog/hf/hn/producthunt/reddit/social/submission |
| sourceUrl | url | yes | |
| title | string | no | |
| rawText | text | no | cached cleaned text |
| aiSummary | text | no | |
| confidence | number | no | 0-100 |
| fetchedAt | datetime | no | |
| submittedAt | datetime | no | |
| status | enum | yes | active/ignored/stale/broken |
| createdAt | datetime | yes | |


### 6.5 Submission

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| url | url | yes | |
| type | enum | yes | project/opportunity/free_credits/github_repo/agent/bounty/creator_content/correction/risk_report/sponsored_interest |
| note | text | no | |
| contactEmail | string | no | private |
| socialHandle | string | no | public only if opted in |
| contentUrl | url | no | creator post/video/article |
| publicCreditOptIn | boolean | no | |
| submitterIpHash | string | no | anti-abuse |
| userAgentHash | string | no | anti-abuse |
| status | enum | yes | received/extracted/needs_review/published/rejected/merged |
| linkedProjectId | string | no | |
| linkedOpportunityId | string | no | |
| reviewReason | text | no | |
| createdAt | datetime | yes | |
| updatedAt | datetime | yes | |


### 6.6 Creator

V1 轻量，不要求登录。

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| displayName | string | yes | |
| handle | string | no | |
| platform | enum | no | x/linkedin/youtube/bilibili/wechat/zhihu/github/other |
| profileUrl | url | no | |
| avatarUrl | url | no | |
| role | enum | no | scout/creator/researcher/project_member |
| status | enum | yes | pending/visible/hidden/rejected |
| qualityScore | number | no | admin/manual first |
| createdAt | datetime | yes | |
| updatedAt | datetime | yes | |


### 6.7 CreatorContent

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| creatorId | string | no | |
| projectId | string | no | |
| opportunityId | string | no | |
| contentUrl | url | yes | |
| platform | enum | no | |
| contentType | enum | yes | post/thread/video/article/tutorial/benchmark/review/correction |
| title | string | no | |
| summary | text | no | |
| contributionType | enum | yes | discovery/explanation/validation/tutorial/benchmark/builder_proof/risk_report/correction |
| publicCreditLabel | enum | no | spotted_by/explained_by/validated_by/tutorial_by/benchmarked_by/built_by/risk_flagged_by/corrected_by |
| qualityLabel | enum | no | high/medium/low/spam |
| riskLabels | enum[] | no | |
| isSponsored | boolean | yes | default false |
| status | enum | yes | pending/visible/hidden/rejected |
| createdAt | datetime | yes | |
| updatedAt | datetime | yes | |


### 6.8 ProjectAcknowledgement

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| projectId | string | yes | |
| creatorContentId | string | no | |
| acknowledgementType | enum | yes | repost/reply/official_correction/listing_update/thank_you |
| sourceUrl | url | yes | |
| note | text | no | |
| createdAt | datetime | yes | |


### 6.9 ScoreSnapshot

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| entityType | enum | yes | opportunity/project/creator |
| entityId | string | yes | |
| scoreType | enum | yes | organic/admin_override/creator_manual/creator_auto/project_momentum |
| score | number | yes | |
| components | json | yes | 各项分数 |
| explanation | text | no | public/admin |
| createdBy | string | no | system/admin user id |
| createdAt | datetime | yes | |


### 6.10 OutboundClick

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| opportunityId | string | no | |
| projectId | string | no | |
| targetUrl | url | yes | |
| ctaType | string | no | |
| sourceModule | string | no | homepage/category/detail/project |
| category | string | no | |
| visitorIdHash | string | no | privacy-preserving |
| sessionIdHash | string | no | |
| isSponsored | boolean | yes | default false |
| createdAt | datetime | yes | |


### 6.11 AdminUser

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| email | string | yes | |
| role | enum | yes | owner/admin/editor/viewer |
| createdAt | datetime | yes | |
| updatedAt | datetime | yes | |


### 6.12 GithubMetricSnapshot

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| projectId | string | yes | FK Project |
| repoUrl | url | yes | |
| stars | number | no | |
| forks | number | no | |
| watchers | number | no | |
| openIssues | number | no | |
| pullRequests | number | no | if available |
| contributors | number | no | if available |
| releases | number | no | |
| topics | json | no | |
| license | string | no | |
| lastPushedAt | datetime | no | |
| capturedAt | datetime | yes | |

### 6.13 LinkGraphEdge

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| fromEntityType | enum | yes | project/opportunity/evidence/creator_content/submission/source |
| fromEntityId | string | yes | |
| toEntityType | enum | yes | project/opportunity/evidence/creator_content/url |
| toEntityId | string | no | optional if URL only |
| toUrl | url | no | |
| relationType | enum | yes | official_link/source_of/social_proof/mentions/submitted_by/acknowledged_by |
| confidence | number | no | |
| createdAt | datetime | yes | |

### 6.14 ReviewQueueItem

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| entityType | enum | yes | project/opportunity/submission/creator_content/evidence |
| entityId | string | yes | |
| priority | enum | yes | high/medium/low |
| reason | text | yes | |
| status | enum | yes | open/resolved/dismissed |
| assignedTo | string | no | AdminUser id |
| createdAt | datetime | yes | |
| resolvedAt | datetime | no | |

### 6.15 SourceJobRun

用于记录 scheduled/manual source run，支撑 M3 的最小自动化闭环和 M6 的 automation hardening。

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | string/uuid | yes | |
| sourceId | string | yes | FK Source |
| jobType | enum | yes | scheduled/manual/backfill/retry |
| status | enum | yes | queued/running/success/partial_failed/failed/blocked |
| startedAt | datetime | no | |
| finishedAt | datetime | no | |
| rawEvidenceCreated | number | no | |
| candidatesCreated | number | no | |
| errorMessage | text | no | |
| createdAt | datetime | yes | |


## 7. 状态机

### Opportunity State

```text
draft
  -> needs_review
  -> published
  -> expired
  -> archived

needs_review
  -> published
  -> rejected
  -> merged

published
  -> needs_review
  -> expired
  -> hidden
```

规则：

- `published` 必须有 source URL、RawEvidence/Evidence、CTA、trust label、risk label、why ranked。
- `points_airdrop`、wallet、high risk、sponsored、homepage top placement 必须人工审核。
- `commercialLabel`、sponsored/featured 状态不能提升 `organicScore`。
- AI extraction candidate 只能进入 draft/needs_review，不能绕过人工审核发布敏感项。
- `expired` 不进普通榜单，但可以在详情页标记为过期。

### Submission State

```text
received
  -> extracted
  -> needs_review
  -> published / rejected / merged
```

### CreatorContent State

```text
pending
  -> visible
  -> hidden
  -> rejected
```

规则：

- `isSponsored=true` 必须在前台标记。
- unsupported reward claims 必须进入 review。
- low-quality spam 不显示 public credit。


## 8. API 规格

路径可按技术栈调整，以下是逻辑接口。

### Public APIs

#### GET `/api/opportunities`

Query:

- `category`
- `type`
- `tag`
- `risk`
- `trust`
- `limit`
- `cursor`
- `sort=rank|freshness|momentum`

Response:

```json
{
  "items": [
    {
      "id": "opp_123",
      "slug": "example-ai-free-credits",
      "projectName": "ExampleAI",
      "title": "Claim free API credits",
      "rewardType": "free_credits",
      "estimatedMinutes": 5,
      "difficulty": "beginner",
      "trustLabel": "official_source",
      "riskLabels": ["reward_not_guaranteed"],
      "whyRanked": "Clear official offer + active GitHub + low effort.",
      "spottedBy": "@alice",
      "primaryCtaLabel": "Go claim"
    }
  ],
  "nextCursor": null
}
```

#### GET `/api/opportunities/[slug]`

返回详情、sources、creator content、similar opportunities。

#### GET `/api/projects/[slug]`

返回项目详情、active opportunities、creator content、metrics。

#### GET `/api/scouts`

返回本周 Top Scouts / Top Voices。

#### POST `/api/submissions`

Body:

```json
{
  "url": "https://example.com/free-credits",
  "type": "free_credits",
  "note": "Official offer page",
  "contactEmail": "optional@example.com",
  "socialHandle": "@alice",
  "contentUrl": "https://x.com/alice/status/123",
  "publicCreditOptIn": true
}
```

Response:

```json
{
  "ok": true,
  "submissionId": "sub_123",
  "status": "received"
}
```

#### POST `/api/events`

Body:

```json
{
  "eventName": "outbound_click",
  "opportunityId": "opp_123",
  "projectId": "proj_123",
  "sourceModule": "opportunity_detail",
  "targetUrl": "https://example.com",
  "ctaType": "go_claim"
}
```

用于：

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


### Admin APIs

#### GET `/api/admin/review`

Query:

- `type=opportunity|submission|creator_content|project`
- `risk=high|medium|low`
- `status=needs_review|pending`

#### GET `/api/admin/sources`

List configured sources with status, allowed-use notes, last run, failures, and enabled flag。

#### POST `/api/admin/sources`

Create source。

#### PATCH `/api/admin/sources/[id]`

Update source config、priority、frequency、fetchMethod、allowedUseNotes、enabled。

#### POST `/api/admin/sources/[id]/run`

Trigger a manual source run. V1 should support at least one safe source that creates RawEvidence and reviewable AI drafts。

#### GET `/api/admin/raw-evidence`

List RawEvidence by source、fetchStatus、review status、checksum、date。

#### POST `/api/admin/raw-evidence/import`

Manually import a URL or raw evidence record。

#### POST `/api/admin/raw-evidence/[id]/extract`

Run AI extraction and create project/opportunity candidate drafts for admin review。

#### POST `/api/admin/opportunities`

Create opportunity。

#### PATCH `/api/admin/opportunities/[id]`

Update opportunity。

#### POST `/api/admin/opportunities/[id]/publish`

Publish。

#### POST `/api/admin/opportunities/[id]/expire`

Expire。

#### POST `/api/admin/opportunities/[id]/reject`

Reject with reason。

#### POST `/api/admin/projects/[id]/merge`

Body:

```json
{
  "targetProjectId": "proj_target",
  "redirectOldSlug": true
}
```

#### PATCH `/api/admin/creator-content/[id]`

Update content, contribution type, quality, visibility。

#### POST `/api/admin/score/recalculate`

Recalculate scores for selected entities。


## 9. 评分规则

### Opportunity Score

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

要求：

- public UI 展示 `whyRanked`，不一定展示具体分数。
- social proof capped，不能让大 V 单独决定排名。
- clicks、submissions、social proof 都是 capped signals，不能压过 official evidence、freshness 和 risk。
- sponsored/featured/commercialLabel 不进入 organic score；商业位必须单独标记。
- admin override 必须和 organic score 分开保存，并记录 reason。
- risk penalty 可直接让机会进入 `needs_review` 或隐藏。

### Creator Score

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

V1 可人工打质量分，V2 再自动化。


## 10. 审核规则

### 自动发布允许

V1 beta 默认可以关闭自动发布，使用人工 approval。若开启低风险自动发布 feature flag，必须满足全部条件：

- official source 或 high-confidence GitHub/open-source evidence。
- low risk。
- 不包含 wallet/private key。
- 不包含 guaranteed reward/airdrop/star。
- 非 sponsored。
- 非首页 Top placement。
- 非 points_airdrop/token/wallet/high-value reward。
- duplicate check clear。
- AI confidence/source confidence 达到阈值。

若任一条件不满足，只能进入 draft/needs_review。

### 必须人工审核

- airdrop/token/wallet。
- high-value reward。
- unclear eligibility。
- no official source。
- AI confidence low。
- duplicate ambiguous。
- sponsored/featured。
- creator content includes reward claims。
- user risk report。
- homepage Top 10。


## 11. Analytics

### 事件列表

| Event | Trigger | Required Props |
| --- | --- | --- |
| `leaderboard_view` | 榜单页加载 | category, source |
| `opportunity_impression` | 机会卡片曝光 | opportunityId, category, rank |
| `opportunity_detail_view` | 详情页加载 | opportunityId, projectId |
| `outbound_click` | 点击官方 CTA | opportunityId, projectId, ctaType, targetUrl |
| `filter_apply` | 使用筛选 | category, filter |
| `submit_url` | 可选提交/纠错 URL | type |
| `submit_social_proof` | 提交 creator content | platform, contentType |
| `share_card_click` | 点击/下载分享卡 | entityType, entityId |
| `creator_credit_view` | creator credit 展示/点击 | creatorId, contentId |
| `project_acknowledgement` | 记录项目认可 | projectId, contentId |
| `subscribe_submit` | 订阅 | sourceModule |
| `report_issue` | 风险/错误报告 | opportunityId, issueType |
| `admin_decision` | 后台审核动作 | entityType, entityId, decision |

### V1 Dashboard 指标

- qualified outbound clicks
- top categories by CTR
- optional submissions/corrections per day
- creator/social proof submissions
- review queue size
- reviewable draft generation rate
- auto-publish rate, only if low-risk auto-publish feature flag is enabled
- rejected spam count
- top opportunities by outbound CTR
- top creators by approved contribution count
- source job success/failure count


## 12. SEO 需求

页面必须有：

- title
- meta description
- canonical URL
- Open Graph title/description/image
- structured data 可后置

推荐 title：

- Home: `TuringScout - AI Opportunities Worth Trying Today`
- Category: `{Category} AI Opportunities - TuringScout`
- Opportunity: `{Opportunity Title} - {Project Name} | TuringScout`
- Project: `{Project Name} AI Opportunities | TuringScout`


## 13. 安全与风控

必须：

- URL 校验。
- submission rate limit。
- basic bot/honeypot。
- admin auth。
- 不公开 email、IP、user agent。
- sponsored/featured 明确标记。
- creator content 和 official source 分开。
- 不展示 guaranteed reward/airdrop/stars 文案。
- wallet/token/airdrop/high-risk/sponsored/homepage top placement 必须人工审核。
- ProductHunt/Reddit/social 等条款不明确来源不得作为自动化依赖。

建议：

- visitorId/sessionId hash。
- admin audit log。
- suspicious click detection。
- domain blocklist。
- content moderation flag。


## 14. V1 Seed 数据要求

上线前至少：

- 50-100 个项目。
- 60+ published opportunities。
- 3-4 个首批分类每类至少 10 条；高风险/possible-airdrop 类可以 manual-only 或后置。
- 至少 20 条带 creator/social proof。
- 至少 10 条带 GitHub metrics。
- 至少 5 个 scout/creator 可用于 `/scouts` 页面。
- 至少 100 条 RawEvidence，用于证明来源、重新处理和后续报告。
- 至少 1 个 production-safe scheduled source job 产生过 RawEvidence 和 reviewable candidate。

每条 published opportunity 必须有：

- project
- title/hook
- primary CTA
- at least one source URL
- trust label
- risk label
- why ranked
- last checked time


## 15. Definition Of Done

一个功能完成必须满足：

- 页面/接口可用。
- 数据字段完整。
- 错误状态和空状态处理。
- 移动端可用。
- 基础 analytics 事件触发。
- admin 可维护。
- 风险文案符合 trust rules。
- 有基本测试或手动验收记录。


## 16. V1 Launch Checklist

- 首页、分类、详情、项目、可选提交/纠错、方法论、scouts 页面可访问。
- Admin 审核队列可用。
- Source registry 可用，且至少一个 scheduled source job 能创建 RawEvidence 和 reviewable AI draft。
- 提交后能进入后台。
- 发布机会能出现在榜单。
- CTA 点击能记录并跳转。
- sponsored/featured 标签显示正确。
- creator credit 显示正确。
- official source 与 creator content 分开展示。
- private email/contact/IP/user agent 不在前台显示。
- 过期/高风险/未审核内容不会进入 Top 榜。
- SEO title/meta 基本完整。
- 移动端检查通过。
- 首批 seed 数据达到要求。
