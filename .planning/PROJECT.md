# Mosaic — VALORANT Scouting Report Generator

## What This Is

An automated competitive intelligence platform for professional VALORANT esports. Coaching staff select an opponent team, the system pulls historical match data from the GRID API, analyzes patterns across matches, and generates a comprehensive scouting report with team strategies, player tendencies, composition analysis, and data-backed counter-strategies. Built for the Cloud9 x JetBrains "Sky's The Limit" Hackathon.

## Core Value

Reduce pre-match scouting from 8+ hours of manual VOD review to under 90 seconds of automated, data-driven analysis — while increasing depth and consistency.

## Requirements

### Validated

- ✓ Next.js 16 project scaffold with TypeScript — existing
- ✓ Tailwind CSS 4 styling infrastructure — existing
- ✓ Vercel deployment target configured — existing

### Active

**Data Integration:**
- [ ] GRID API authentication and client
- [ ] Team roster and metadata fetching
- [ ] Historical match data ingestion
- [ ] Round-by-round event data parsing
- [ ] Data normalization to internal schema
- [ ] Supabase PostgreSQL storage layer
- [ ] Query result caching (24-hour TTL)

**Report Generation:**
- [ ] Team selection interface with search
- [ ] Match range configuration (count, date, tournament, map filters)
- [ ] Report generation under 60 seconds
- [ ] Progress indication during generation

**Team Strategy Analysis:**
- [ ] Attack-side pistol round patterns
- [ ] Defense-side default setups
- [ ] Mid-round adaptation patterns
- [ ] Economy management tendencies
- [ ] Site preference percentages

**Player Tendency Analysis:**
- [ ] Individual performance profiles (ACS, KAST, K/D)
- [ ] Agent pool with pick/win rates
- [ ] First blood statistics
- [ ] Clutch performance metrics
- [ ] Dueling patterns by position

**Composition Analysis:**
- [ ] Most played team compositions
- [ ] Composition win rates by map
- [ ] Meta adaptation timeline
- [ ] Map-specific agent preferences

**Counter-Strategy Generation:**
- [ ] Weakness identification with statistical backing
- [ ] Actionable recommendations
- [ ] Confidence scoring (sample size, recency weighting)
- [ ] Contextual caveats

**Report Output:**
- [ ] Executive summary with top insights
- [ ] Interactive tabbed UI (strategies, players, comps, maps, counters)
- [ ] Data visualizations (charts, stat cards)
- [ ] Shareable report links

### Out of Scope

- PDF export — defer to post-hackathon
- Presentation mode — defer to post-hackathon
- Real-time live match analysis — requires different data pipeline
- VOD/video processing — out of GRID API scope
- Player positioning heatmaps — requires visual data not in API
- Ranked/competitive ladder data — non-professional, out of scope
- Social media sentiment — different data source
- Third-party coaching platform integration — post-hackathon

## Context

**Hackathon:** Cloud9 x JetBrains "Sky's The Limit" — Category 2: Automated Scouting Report Generator

**Data source:** GRID API ecosystem
- Central Data API (GraphQL) — tournaments, teams, rosters, match metadata
- Series State API (GraphQL) — round-by-round events, kills, economy, abilities
- API credentials ready

**Tournament scope:** VCT Americas (past two years)
- VCT Americas League (regular season)
- VCT Americas Kickoff
- VCT Masters featuring Americas teams
- VCT Champions featuring Americas teams

**Target users:**
- Head coaches — strategic planning
- Analysts — deep-dive research
- Players — individual matchup prep
- Team managers — competitive intelligence

**Existing codebase:** Next.js 16 boilerplate with Tailwind CSS. No application logic yet.

## Constraints

- **Data source**: GRID API only — no other data sources available
- **Statistical significance**: Minimum 5 matches required for pattern detection
- **Performance**: Report generation must complete in <60 seconds
- **Timeline**: ~2 weeks to hackathon deadline
- **Deployment**: Vercel (frontend) + Supabase (database + functions)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vercel + Supabase over FastAPI | Simpler deployment, single ecosystem, serverless scaling | — Pending |
| Supabase Functions for analytics | Direct PostgreSQL access, Deno runtime, no cold start issues | — Pending |
| TypeScript throughout | Type safety for complex data models, better tooling | — Pending |
| Skip PDF export for MVP | Focus on core web experience, PDF adds complexity | — Pending |

---
*Last updated: 2026-01-28 after initialization*
