# TuringScout Docs

This folder is intentionally small and canonical.

## Read Order

1. `00-overview.md` - what TuringScout is and why it exists
2. `01-product-roadmap.md` - V0-V5 roadmap and version boundaries
3. `02-v1-prd.md` - V1 product requirements
4. `03-v1-system-design.md` - V1 system/data/automation design
5. `04-v1-ux-spec.md` - V1 user experience and page logic
6. `05-go-to-market.md` - launch, growth, and monetization plan
7. `06-feasibility-research.md` - feasibility, risks, and validation plan
8. `07-social-influence-loop.md` - TuringScout social influence mechanism
9. `08-naming.md` - naming rationale and alternatives
10. `09-product-engineering-spec.md` - developer-facing product and engineering spec
11. `10-development-plan.md` - development milestones, sprints, and implementation plan

## Canonical Rule

The `00-10` docs are the current source of truth.

`archive/` contains historical notes. If an archived doc conflicts with a canonical doc, the canonical doc wins.

## V1 Summary

V1 is an automation-first AI OPC leaderboard engine with GitHub intelligence, raw evidence storage, and lightweight scout/creator credit. Submissions are optional inputs, not the operating backbone.

It helps opportunity hunters quickly find AI projects worth trying, claiming, starring, testing, or following.

V1 avoids:

- heavy social crawling
- wallet/token mechanics
- reward escrow
- fake growth
- mandatory login before browsing

V1 should still include a lightweight social loop:

- public credit for scouts/creators who discover, submit, correct, or explain opportunities
- shareable ranking cards
- weekly creator/scout recognition
- project update and repost prompts

The strategic rule:

> The leaderboard is the surface. The evidence graph is the moat. Scout/creator status is the growth loop. Adoptionshare and project intelligence are the future business model.

## Developer Handoff

For implementation, start with:

1. `09-product-engineering-spec.md`
2. `10-development-plan.md`
3. `03-v1-system-design.md`
4. `02-v1-prd.md`
