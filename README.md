# TuringScout

TuringScout is an AI opportunity and adoption leaderboard: a lightweight, AI-automated, OPC-style platform that helps users discover AI projects worth trying and helps projects earn real attention, usage, and developer adoption.

## Current App

This repo now includes a runnable V1 MVP slice:

- Next.js App Router + TypeScript + Tailwind CSS
- Prisma + SQLite local development database
- Evidence-first public pages for home, leaderboards, opportunities, projects, scouts, methodology, and submit/correction
- Seed data for 4 initial categories and source-backed published opportunities
- Public APIs for opportunities, project details, submissions, analytics events, and tracked outbound redirects

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm run lint
npm run build
npm run db:reset
```


## Admin / V1 Operations

Admin is available at `http://localhost:3000/admin`. For local development, set `ADMIN_PASSWORD` in `.env`; if unset, the app uses `turingscout-admin`.

V1 operational flows now include:

- Source registry: create sources and run a safe source pilot from `/admin/sources`
- Raw evidence: import URLs, store provenance, and extract reviewable AI drafts from `/admin/raw-evidence`
- Review queue: publish or reject draft opportunities from `/admin/review`
- Scoring: recalculate organic scores from `/admin` without mixing sponsored labels into ranking
- Analytics: inspect events and outbound clicks from `/admin/analytics`

The seed creates 60 published opportunities, 100 raw evidence records, 25 visible creator-content credits, 5 visible scouts, and 1 source-job/review-queue pilot candidate.



## Production Hardening

This repo includes baseline production hardening:

- Security headers via `next.config.ts`
- `/api/health` database and environment validation endpoint
- `/admin/settings` environment diagnostics
- `Dockerfile` for container builds
- GitHub Actions workflow at `.github/workflows/ci.yml`
- Public API response shapers in `src/lib/public-shapes.ts` to avoid leaking private submission/contact fields
- Extended smoke tests for admin automation, report generation, project claims, campaign proof submission, security headers, and public API privacy

## Post-V1 Version Coverage

The app now includes functional slices for the later roadmap versions too:

- **V1.5 Automation**: `/admin/automation`, batch extraction, digest drafts, notification drafts, cleanup checks, category trend snapshots.
- **V2 Profiles + Attribution**: `/auth`, `/me`, `/creators/[handle]`, saved/attempted/completed opportunities, proof links, project claims, attribution events.
- **V3 Campaigns**: `/campaigns`, `/campaigns/[slug]`, sponsored disclosure, campaign tasks, proof submission, admin campaign review surface.
- **V4 Intelligence/API**: `/intelligence`, `/reports/[slug]`, `/api/v1/opportunities`, `/api/v1/projects`, `/api/v1/categories/[category]`, `/api/v1/reports/project/[slug]`.

Run the full local verification suite:

```bash
npm run verify
```

This runs lint, production build, starts the app on a smoke-test port, validates public/admin/auth/API flows, checks seeded data thresholds, and verifies private contact/IP fields are not exposed through public opportunity APIs.

## Current Direction

V1 is intentionally narrow:

> Automated public-source discovery + GitHub intelligence + evidence-first AI leaderboards + lightweight scout/creator credit.

But the product should not be only a static directory. The growth loop should be:

> AI opportunities get ranked, creators explain/share them, projects notice and respond, creators get visibility, and better opportunities come back into the system.

V1 is not a DAO, token system, reward escrow, fake-star marketplace, or full social listening platform.

## Simple Description

For users:

> TuringScout is a daily AI opportunity board. It tells you which AI projects are worth trying today, what you might get, how much effort it takes, and what risks to check.

For scouts and creators:

> TuringScout gives public credit to people who discover, explain, validate, or improve useful AI opportunities early; submission is optional, not required for the system to run.

For projects:

> TuringScout is a lightweight launch and discovery channel that sends interested users and builders to official project links, backed by public evidence instead of fake traffic.

Fast Chinese pitch:

> AI 机会榜 + AI Scout 影响力榜：每天发现值得试的 AI 项目，也让最早发现、解释和验证这些机会的 Scout / 创作者被看见。

## Core Idea

TuringScout combines:

- **Influence graph logic**: turn useful discovery, explanation, and adoption into measurable reputation and future opportunities
- **Evidence graph logic**: automatically store raw evidence, sources, score components, and risk rationale so rankings can become reports, campaigns, and APIs later
- **ProductHunt logic**: public discovery and launch-style rankings
- **OPC logic**: aggregate and structure other people's public project signals
- **Influencer loop**: give scouts, creators, and KOLs public credit for discovering, explaining, and spreading useful opportunities
- **AI automation**: use agents to extract, score, summarize, rank, publish, and report
- **Fairness**: organic rankings cannot be bought; sponsored placements must be labeled

## Canonical Docs

Read these in order:

1. `docs/00-overview.md` - positioning, core thesis, and principles
2. `docs/01-product-roadmap.md` - V0-V5 roadmap and version boundaries
3. `docs/02-v1-prd.md` - V1 product requirements
4. `docs/03-v1-system-design.md` - V1 technical/data/automation design
5. `docs/04-v1-ux-spec.md` - V1 user experience and page logic
6. `docs/05-go-to-market.md` - launch, growth, and monetization plan
7. `docs/06-feasibility-research.md` - feasibility, risks, and validation plan
8. `docs/07-social-influence-loop.md` - TuringScout social influence mechanism
9. `docs/08-naming.md` - naming rationale and alternatives
10. `docs/09-product-engineering-spec.md` - developer-facing product and engineering spec
11. `docs/10-development-plan.md` - development milestones, sprints, and implementation plan

Historical notes and earlier brainstorming are in `docs/archive/`.

## V1 Non-Goals

- No full X/Twitter API dependency
- No full WeChat/Zhihu/social crawling
- No wallet or token
- No reward escrow or automated payout
- No guaranteed GitHub stars
- No exact global mindshare claim
- No heavy user social graph
- No complex creator payout system
