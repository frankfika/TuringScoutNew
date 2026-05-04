# 03 — V1 系统设计

## 一、数据流架构

### 1.1 整体数据流

```
┌──────────┐    ┌─────────────┐    ┌────────────┐    ┌──────────────────┐
│  Source  │───→│ RawEvidence  │───→│ Extraction  │───→│ Project/         │
│ (数据源)  │    │ (原始证据)    │    │ (AI信息抽取) │    │ Opportunity      │
└──────────┘    └─────────────┘    └────────────┘    │ (项目/机会)       │
                                                     └────────┬─────────┘
                                                              │
┌──────────┐    ┌─────────────┐    ┌────────────┐    ┌───────┴─────────┐
│Publishing│←───│  Ranking    │←───│  Scoring    │←───│ Evidence        │
│ (发布)    │    │ (排序)       │    │ (评分)       │    │ (指标数据)       │
└──────────┘    └─────────────┘    └────────────┘    └─────────────────┘
```

### 1.2 各阶段说明

| 阶段 | 输入 | 输出 | 频率 | 说明 |
|------|------|------|------|------|
| **采集** | GitHub/HN API | RawEvidence | Tier1: 1h; Tier2: 6h | 原始数据抓取和存储 |
| **抽取** | RawEvidence | Extraction | 实时（采集后触发） | 结构化信息提取 |
| **充实** | Extraction + 已有数据 | Project/Opportunity | 实时 | 去重、合并、补全 |
| **AI 点评** | Project/Opportunity 数据 | AIReview | 充实后异步触发 | AI 自动生成亮点/适合谁/对比/打分解读 |
| **评分** | Project/Opportunity + 指标 + AIReview | ScoreSnapshot | 每次充实后 | 多维评分计算 |
| **排序** | ScoreSnapshot | Ranking | 评分后 | 分类排序 |
| **发布** | Ranking + 审核结果 | 对外展示 | 排序后 | 低风险自动，高风险人工 |

---

## 二、核心数据模型

### 2.1 Source（数据源）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | String | 数据源名称，如 "GitHub Trending" |
| url | String | 数据源 URL |
| type | Enum | GITHUB_TRENDING / GITHUB_SEARCH / HN_SHOW / HUGGING_FACE / PRODUCT_HUNT / REDDIT / TWITTER / ZHI_HU / ARXIV |
| tier | Enum | TIER_1 / TIER_2 / TIER_3 |
| enabled | Boolean | 是否启用 |
| schedule | String | Cron 表达式，如 "0 * * * *" |
| lastRunAt | DateTime | 上次执行时间 |
| lastStatus | Enum | SUCCESS / FAILURE / PENDING |
| config | JSON | 额外配置（API Key、参数等） |

### 2.2 RawEvidence（原始证据）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| sourceId | UUID → Source | 来源 |
| url | String | 原始 URL |
| rawData | JSON | 原始响应数据 |
| fingerprint | String | 内容指纹（用于去重） |
| status | Enum | PENDING / EXTRACTED / DUPLICATE / FAILED |
| collectedAt | DateTime | 采集时间 |

### 2.3 Project（项目）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| slug | String (unique) | URL 友好标识 |
| name | String | 项目名称 |
| description | Text | 项目描述 |
| url | String | 项目主 URL |
| githubUrl | String? | GitHub 仓库 URL |
| language | String? | 主要编程语言 |
| topics | String[] | 话题标签 |
| category | Enum | 项目分类 |
| firstSeenAt | DateTime | 首次发现时间 |
| lastSeenAt | DateTime | 最后更新时间 |
| totalOpportunities | Int | 关联机会总数 |
| status | Enum | ACTIVE / INACTIVE / ARCHIVED |

### 2.4 Opportunity（机会）

| 字段 | 类型 | 说明 | 对用户可见 |
|------|------|------|-----------|
| id | UUID | 主键 | — |
| slug | String (unique) | URL 友好标识 | — |
| projectId | UUID → Project | 关联项目 | — |
| title | String | 机会标题 | ✅ 列表 + 详情 |
| description | Text | 机会描述 | ✅ 详情 |
| type | Enum | 机会类型（仅4种：免费试用/开源/积分/竞赛） | ✅ 列表（emoji图标） |
| rewardValue | String? | 奖励描述 | ✅ 详情 |
| requirements | Text? | 参与条件 | ✅ 详情 |
| actionUrl | String | CTA 链接 | ✅ 详情 |
| expiresAt | DateTime? | 过期时间 | ✅ 详情 |
| riskLevel | Enum | LOW / MEDIUM / HIGH | ❌ 仅后台审核用 |
| trustScore | Float | 可信度评分 | ❌ 仅后台排序用 |
| autoPublished | Boolean | 是否自动发布 | ❌ 仅后台 |
| publishedAt | DateTime? | 发布时间 | ❌ 仅后台 |
| status | Enum | 状态流转 | ❌ 仅后台 |

### 2.5 Evidence（证据/指标）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| projectId | UUID → Project | 关联项目 |
| metric | Enum | 指标类型 |
| value | Float | 指标值 |
| recordedAt | DateTime | 记录时间 |

指标类型包括：STAR_COUNT、STAR_GROWTH_RATE、FORKS、OPEN_ISSUES、HN_POINTS、HN_COMMENTS、TWITTER_MENTIONS、REDDIT_MENTIONS、PAPER_CITATIONS

### 2.6 AIReview（AI 自动点评）★ 核心差异化

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| projectId | UUID → Project? | 关联项目 |
| opportunityId | UUID → Opportunity? | 关联机会 |
| highlights | JSON (string[]) | 3-5 条项目亮点 |
| suitableFor | String | 适合人群，一句话 |
| comparisons | JSON | 同类项目对比 [{name, difference}] |
| totalScore | Float | AI 综合评分 |
| dimensionScores | JSON | 各维度 {score, explanation} |
| generatedAt | DateTime | AI 生成时间 |
| aiModel | String? | 使用的 AI 模型 |
| adminEdited | Boolean | 管理员是否修改过 |
| adminNotes | String? | 管理员修改备注 |

### 2.7 ScoreSnapshot（评分快照）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| projectId | UUID → Project | 项目 |
| opportunityId? | UUID → Opportunity | 机会（可选） |
| totalScore | Float | 总分 |
| dimensions | JSON | 各维度评分详情 |
| calculatedAt | DateTime | 计算时间 |

> **注意**：V1 不含 Creator 和 ScoutCredit 模型。没有用户系统，所有数据由 AI 自动抓取和点评。V2 引入 Scout 系统时再加这两个表。

---

## 三、评分算法

### 3.1 评分维度

| 维度 | 权重 | 子指标 | 说明 |
|------|------|--------|------|
| **AI 相关性** | 25% | 项目描述 AI 关键词匹配、语言/框架 AI 关联度 | 确保是 AI 相关项目 |
| **机会价值** | 25% | 奖励价值等级、机会类型权重 | 免费额度 > 积分 > Bounty |
| **热度动量** | 20% | Star 增长率、近期讨论量、HN 热榜位置 | 关注上升趋势而非绝对量 |
| **可信度** | 15% | 来源多样性、GitHub 仓库状态、社区认可度 | 多源验证加分 |
| **易用性** | 10% | 参与门槛（无需注册 > 需注册 > 需 KYC） | 越低越好 |
| **时效性** | 5% | 发布时间、机会过期倒计时 | 越新越好 |
| **风险扣分** | - | 付费要求 -10%、KYC 要求 -15%、单一来源 -10% | 有风险时扣分 |

### 3.2 评分公式

```
Score = AI_Relevance * 0.25 + Value * 0.25 + Momentum * 0.20
      + Credibility * 0.15 + Accessibility * 0.10 + Recency * 0.05
      - Risk_Penalty

其中每个维度归一化到 [0, 100]
Risk_Penalty = sum(各风险项扣分)
最终总分范围：[0, 100]
```

### 3.3 热度动量计算

```
Momentum = log(1 + star_growth_7d) * 10          # Star 增长
         + log(1 + hn_points_7d) * 5             # HN 热度
         + log(1 + discussion_count_7d) * 3      # 多平台讨论量
         * time_decay_factor                      # 时间衰减（越新权重越高）
```

---

## 四、数据源策略

### Tier 1 — 自动高频抓取

| 数据源 | 类型 | 频率 | 说明 |
|--------|------|------|------|
| GitHub Trending | API | 每小时 | AI 相关 repos，按 language 过滤 |
| GitHub Search | API | 每小时 | 关键词搜索（ai, ml, llm, agent 等） |
| Hacker News /show | API | 每天 4 次 | Show HN AI 相关 |
| Hugging Face | API | 每天 4 次 | Trending models/spaces |

### Tier 2 — 按需补充抓取

| 数据源 | 类型 | 频率 | 说明 |
|--------|------|------|------|
| ProductHunt | API/爬虫 | 每天 2 次 | AI 分类新品 |
| Reddit r/MachineLearning | API | 每天 2 次 | 热门讨论中的项目 |

> **V1 仅启用 Tier 1 数据源**（GitHub Trending + HN + HuggingFace）。Tier 2 数据源在 V1.5 按需启用。

---

## 五、去重和实体解析

### 5.1 URL 去重
- 标准化 GitHub URL（去除 trailing slash、.git）
- 相同 domain+path 视为重复

### 5.2 项目名去重
- GitHub repo full name 完全匹配 → 同一项目
- 名称相似度 > 0.85 + 同一语言 → 待人工确认
- 不同 URL 指向相同 GitHub repo → 合并

### 5.3 机会去重
- 相同 project + 相同 type + 相同 URL → 合并（更新现有记录）

---

## 六、审核机制

| 风险等级 | 判定条件 | 发布策略 |
|---------|---------|---------|
| **低风险** | 免费、开源、多源验证、无 KYC | 自动发布 |
| **中风险** | 需注册、单一来源、限量 | 抽样审核（30%） |
| **高风险** | 付费、需 KYC、单一来源 | 全部人工审核 |

> **V1 审核对象**：AI 自动抓取并抽取的候选机会（CANDIDATE），经管理员审核后发布。不接受用户提交。

### 审核状态流转

```
AI抓取 → 自动抽取 → [自动判定] → 低风险 → 自动发布
                                 → 中风险 → 审核队列 → 通过/拒绝
                                 → 高风险 → 审核队列 → 通过/拒绝
已发布 → 过期 → 自动下架
```

---

## 七、技术选型

| 层面 | 选择 | 理由 |
|------|------|------|
| 前端框架 | Next.js 15 + React 19 | SSR/SSG 对 SEO 友好 |
| 样式 | Tailwind CSS | 快速开发，响应式 |
| 数据库 | PostgreSQL | 关系型数据，JSON 字段支持 |
| ORM | Prisma | 类型安全，迁移管理 |
| 缓存 | Redis (可选) | 排行榜缓存，Session |
| 任务队列 | Inngest / QStash | Cron jobs + 事件驱动 |
| 部署 | Vercel | Next.js 原生支持 |
| 监控 | Sentry + Vercel Analytics | 错误追踪和性能监控 |
