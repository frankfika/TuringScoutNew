# 09 — 开发工程规范

## 一、页面拆分和组件清单

### 1.1 页面路由

| 路由 | 页面 | 渲染方式 | 说明 |
|------|------|---------|------|
| `/` | 首页（机会列表） | SSR (ISR 1h) | Tab 筛选 + 排序 + 机会列表 |
| `/opportunities/[slug]` | 机会详情 | SSR (ISR 1h) | 核心信息 + 折叠详情 + CTA |
| `/projects/[slug]` | 项目详情 | SSR (ISR 1h) | GitHub 指标 + 关联机会 |
| `/methodology` | 关于 | Static | 数据来源 + 评分逻辑 |
| `/admin/login` | 后台登录 | Static | 管理员认证 |
| `/admin` | 后台面板 | CSR | AI抓取审核 + 数据源管理 |
| `/admin/review` | 审核队列 | CSR | AI 抓取候选机会审核 |
| `/admin/sources` | 数据源管理 | CSR | Source 状态和手动触发 |

### 1.2 核心组件

```
src/
├── components/
│   ├── layout/
│   │   ├── SiteHeader.tsx         # 极简导航栏（Logo + 关于）
│   │   ├── Footer.tsx             # 页脚（数据来源说明）
│   │   └── AdminNav.tsx           # 后台侧边导航
│   ├── opportunity/
│   │   ├── OpportunityRow.tsx     # 列表行（图标+标题+描述+时间）
│   │   ├── OpportunityList.tsx    # 机会列表（含骨架屏、加载更多）
│   │   ├── OpportunityDetail.tsx  # 核心信息区（好处/门槛/CTA）
│   │   ├── OpportunityMeta.tsx    # 折叠详情区（来源/更新时间/注意）
│   │   └── AIReview.tsx           # ★ AI 点评模块（亮点/适合谁/对比/打分解读）
│   ├── project/
│   │   ├── ProjectDetail.tsx      # 项目详情内容
│   │   ├── GitHubMetrics.tsx      # GitHub 指标条
│   │   └── ProjectOpportunities.tsx # 项目关联机会列表
│   ├── ui/
│   │   ├── TypeIcon.tsx           # 机会类型 emoji 映射
│   │   ├── TypeTab.tsx            # 类型筛选 Tab
│   │   ├── Skeleton.tsx           # 骨架屏
│   │   ├── LoadMore.tsx           # 加载更多按钮
│   │   ├── Collapsible.tsx        # 折叠展开组件
│   │   └── EmptyState.tsx         # 空状态
```

**V1 不存在的组件**：SubmitForm、ScoutLeaderboard、Badge、Pagination、ScoreChart

---

## 二、数据库表完整设计

### 2.1 Source（数据源）

```prisma
model Source {
  id         String   @id @default(uuid())
  name       String
  url        String
  type       SourceType
  tier       SourceTier
  enabled    Boolean  @default(true)
  schedule   String   @default("0 * * * *")
  lastRunAt  DateTime?
  lastStatus RunStatus @default(PENDING)
  config     Json     @default("{}")
  rawEvidences RawEvidence[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum SourceType {
  GITHUB_TRENDING
  GITHUB_SEARCH
  HN_SHOW
  HUGGING_FACE
  // 以下 V2+ 再启用
  // PRODUCT_HUNT
  // REDDIT
  // TWITTER
  // ZHI_HU
  // ARXIV
}

enum SourceTier {
  TIER_1
  TIER_2
  TIER_3
}

enum RunStatus {
  PENDING
  RUNNING
  SUCCESS
  FAILURE
}
```

### 2.2 RawEvidence（原始证据）

```prisma
model RawEvidence {
  id          String    @id @default(uuid())
  sourceId    String
  source      Source    @relation(fields: [sourceId], references: [id])
  url         String
  rawData     Json
  fingerprint String
  status      EvidenceStatus @default(PENDING)
  collectedAt DateTime @default(now())
  extraction  Extraction?
}

enum EvidenceStatus {
  PENDING
  EXTRACTED
  DUPLICATE
  FAILED
}
```

### 2.3 Extraction（AI 抽取结果）

```prisma
model Extraction {
  id            String      @id @default(uuid())
  rawEvidenceId String      @unique
  rawEvidence   RawEvidence @relation(fields: [rawEvidenceId], references: [id])
  projectName   String?
  projectUrl    String?
  githubUrl     String?
  description   String?
  language      String?
  topics        Json        @default("[]")
  category      ProjectCategory?
  // AI 自动判定的机会类型
  suggestedType OpportunityType?
  extractedAt   DateTime    @default(now())
}
```

### 2.4 Project（项目）

```prisma
model Project {
  id                String    @id @default(uuid())
  slug              String    @unique
  name              String
  description       String?
  url               String
  githubUrl         String?
  language          String?
  topics            Json      @default("[]")
  category          ProjectCategory?
  status            ProjectStatus @default(ACTIVE)
  firstSeenAt       DateTime  @default(now())
  lastSeenAt        DateTime  @default(now())
  publishedAt       DateTime?
  opportunities     Opportunity[]
  evidences         Evidence[]
  scoreSnapshots    ScoreSnapshot[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum ProjectCategory {
  FRAMEWORK
  MODEL
  TOOL
  PLATFORM
  LIBRARY
  RESEARCH
  APPLICATION
  INFRASTRUCTURE
}

enum ProjectStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### 2.5 Opportunity（机会）

```prisma
model Opportunity {
  id            String    @id @default(uuid())
  slug          String    @unique
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  title         String
  description   String?
  // 用户可见类型，仅4个值
  type          OpportunityType
  // 详情页展示
  rewardValue   String?   // "注册即领$5额度"
  requirements  String?   // "注册账号即可"
  actionUrl     String    // CTA 链接
  expiresAt     DateTime?
  // 后台使用
  riskLevel     RiskLevel @default(LOW)
  autoPublished Boolean   @default(false)
  publishedAt   DateTime?
  status        OpportunityStatus @default(CANDIDATE)
  scoreSnapshots ScoreSnapshot[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum OpportunityType {
  FREE_TRIAL     // 🆓 免费试用
  OPEN_SOURCE    // 📦 开源项目
  POINTS_REWARD  // 🎁 积分奖励
  COMPETITION    // 🏆 奖金竞赛
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

enum OpportunityStatus {
  CANDIDATE       // AI 抽取的候选
  ENRICHING       // 充实中
  PENDING_REVIEW  // 待管理员审核
  PUBLISHED       // 已发布
  REJECTED        // 已拒绝
  EXPIRED         // 已过期
}
```

### 2.6 Evidence（指标快照）

```prisma
model Evidence {
  id          String    @id @default(uuid())
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id])
  metric      MetricType
  value       Float
  recordedAt  DateTime  @default(now())

  @@index([projectId, recordedAt])
}

enum MetricType {
  STAR_COUNT
  STAR_GROWTH_7D
  STAR_GROWTH_30D
  FORK_COUNT
  OPEN_ISSUES
  CONTRIBUTOR_COUNT
  HN_POINTS
  HN_COMMENTS
}
```

### 2.7 ScoreSnapshot（评分快照）

```prisma
model ScoreSnapshot {
  id            String   @id @default(uuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  opportunityId String?
  opportunity   Opportunity? @relation(fields: [opportunityId], references: [id])
  totalScore    Float
  dimensions    Json
  calculatedAt  DateTime @default(now())

  @@index([projectId, calculatedAt])
}
```

### 2.8 AIReview（AI 自动点评）★ 核心差异化表

```prisma
model AIReview {
  id            String   @id @default(uuid())
  projectId     String?
  project       Project?  @relation(fields: [projectId], references: [id])
  opportunityId String?
  opportunity   Opportunity? @relation(fields: [opportunityId], references: [id])

  // AI 生成的点评内容
  highlights    Json      // string[] — 3-5条亮点，如 ["业界最强LLM API", "$5足够试用上千次"]
  suitableFor   String    // 适合谁，如 "想体验大语言模型的开发者，无需绑定信用卡"
  comparisons   Json      // {name: string, difference: string}[] — 同类对比

  // AI 打分解读
  totalScore          Float
  dimensionScores     Json      // {dimension: {score: number, explanation: string}}
  // 例: { aiRelevance: {score: 85, explanation: "GPT系列是当前AI技术栈的核心基础设施"},
  //       momentum:    {score: 94, explanation: "全网讨论度最高的LLM API"},
  //       credibility: {score: 90, explanation: "OpenAI官方产品，多源验证"},
  //       accessibility:{score: 95, explanation: "注册即用，无需信用卡"},
  //       recency:     {score: 80, explanation: "长期有效，非限时活动"} }

  // 元信息
  generatedAt  DateTime @default(now())
  aiModel      String?   // 生成使用的AI模型，如 "claude-opus-4-6"
  adminEdited  Boolean   @default(false)
  adminNotes   String?   // 管理员修改备注
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([projectId, generatedAt])
  @@index([opportunityId, generatedAt])
}
```

> **AIReview 是 TuringScout 的核心壁垒**。每个发布的机会都有一条 AI 自动生成的深度点评。管理员可在后台编辑 AI 输出的任何字段。

### 2.9 AdminSession（管理会话）

```prisma
model AdminSession {
  id        String   @id @default(uuid())
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

**V1 不存在的表**：Creator、ScoutCredit。V2 引入用户系统时再建。

---

## 三、API 路由设计

### 3.1 公开 API（只读）

| 端点 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/opportunities` | GET | `?type=&sort=&page=` | 机会列表 |
| `/api/opportunities/[slug]` | GET | — | 机会详情 |
| `/api/projects/[slug]` | GET | — | 项目详情 |
| `/api/events` | POST | body: event, data | 埋点事件 |

**没有的 API**：`/api/submissions`（不接受提交）、`/api/scouts`（无用户系统）

### 3.2 管理 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/login` | POST | 管理员登录 |
| `/api/admin/logout` | POST | 管理员登出 |
| `/api/admin/review` | GET | 候选机会审核列表 |
| `/api/admin/review/[id]/approve` | POST | 审核通过并发布 |
| `/api/admin/review/[id]/reject` | POST | 审核拒绝 |
| `/api/admin/sources` | GET | 数据源列表 |
| `/api/admin/sources/[id]/run` | POST | 手动触发数据源 |
| `/api/admin/score/recalculate` | POST | 重算评分 |

### 3.3 Cron API（内部）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/cron/sources` | POST | 触发所有启用的数据源 |

---

## 四、OpportunityType 前端映射

```typescript
const TYPE_CONFIG: Record<OpportunityType, { icon: string; label: string }> = {
  FREE_TRIAL:    { icon: "🆓", label: "免费试用" },
  OPEN_SOURCE:   { icon: "📦", label: "开源项目" },
  POINTS_REWARD: { icon: "🎁", label: "积分奖励" },
  COMPETITION:   { icon: "🏆", label: "奖金竞赛" },
};
```

---

## 五、状态流转

```
AI 抓取 → RawEvidence → Extraction（AI 自动抽取基本信息）
                              │
                         Opportunity (CANDIDATE)
                              │
                    ┌──── AI 生成点评 ────┐
                    │  AIReview 自动生成   │
                    │  （亮点+适合谁+对比+打分）│
                    └────────┬────────────┘
                             │
                        评分计算 + 审核
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
                PUBLISHED          REJECTED
                    │
             过期/手动下架
                    │
                    ▼
                 EXPIRED
```

**AI 点评生成时机**：Opportunity 进入 CANDIDATE 状态后，异步触发 AI 生成点评。管理员审核时可以查看 AI 点评并修改。

---

## 六、评分引擎规则

评分维度：AI 相关性(35%) + 热度动量(30%) + 可信度(25%) + 机会价值(10%) - 风险扣分

前端列表按 totalScore 降序排序，**不展示具体分数**。

---

## 七、后台管理功能

### 7.1 AI 抓取审核

| 功能 | 说明 |
|------|------|
| 候选列表 | AI 抓取并自动抽取的候选机会，按评分降序 |
| 快速审核 | 查看 AI 抽取结果，通过/拒绝 + 可选修改 |
| 批量操作 | 低风险高评分可批量通过 |
| 审核历史 | 审核记录可追溯 |

### 7.2 数据源管理

| 功能 | 说明 |
|------|------|
| 数据源列表 | 显示 Source 状态、上次运行时间、上次结果 |
| 启用/禁用 | 切换数据源 |
| 手动触发 | 立即执行一次抓取 |
| 最近日志 | 最近 50 条采集记录 |

### 7.3 评分管理

| 功能 | 说明 |
|------|------|
| 评分重算 | 全量或单项目重算 |
| 权重调整 | 后台调整各维度权重 |

---

## 八、埋点事件

| 事件 | 触发 | 属性 |
|------|------|------|
| `page_view` | 页面加载 | page, referrer |
| `tab_switch` | 切换类型 Tab | tab |
| `sort_change` | 切换排序 | sort |
| `row_click` | 点击列表行 | opportunity_id, position |
| `cta_click` | 点击 CTA 按钮 | opportunity_id, action_url |
| `meta_expand` | 展开详情折叠区 | opportunity_id |
| `load_more` | 点击加载更多 | page |
