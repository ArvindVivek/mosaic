# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Reduce pre-match scouting from 8+ hours of manual VOD review to under 90 seconds of automated, data-driven analysis — while increasing depth and consistency.
**Current focus:** Phase 4 - Report Interface & Team Selection

## Current Position

Phase: 4 of 6 (Report Interface & Team Selection)
Plan: 04-03 of 4 in phase
Status: In progress
Last activity: 2026-01-30 — Completed 04-03-PLAN.md (Advanced filters - date range, tournament, map)

Progress: [███████████████████████████] 100% (18/18 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 18
- Average duration: 4.8 min
- Total execution time: 1.45 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-data-foundation-grid-integration | 4 | 24min | 6min |
| 02-analytics-engine-aggregation | 7 | 37min | 5min |
| 03-report-generation-orchestration | 4 | 15min | 3.75min |
| 04-report-interface-team-selection | 3 | 11min | 3.7min |

**Recent Trend:**
- Last 5 plans: 8min, 5min, 9min, 0min, 2min
- Trend: Excellent (averaging 4.8min, UI work is efficient)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: GRID API integration with batching and rate limiting required from day one (per research findings)
- Phase 2: Aggregation table design is architectural - must be completed before Phase 3 (cannot defer optimization)
- **01-01**: JSONB for event_data to support flexible schema evolution
- **01-01**: GIN indexes with jsonb_path_ops for containment query performance
- **01-01**: Edge Functions use Deno runtime with URL imports (esm.sh)
- **01-01**: Exponential backoff with max 3 retries for GRID API (1s, 2s, 4s)
- **01-01**: Local Supabase development (not cloud)
- **01-02**: GraphQL queries use presumed schema - may need introspection for actual GRID API
- **01-02**: Normalizers handle both connection and array formats for flexibility
- **01-02**: fetch-matches requires teamId OR tournamentId to prevent full pulls
- **01-02**: Pagination safety limit at 500 matches to prevent infinite loops
- **01-03**: Query series status before fetching full state (optimization for unfinished series)
- **01-03**: Economy thresholds: eco <5k, half_buy <15k, force_buy <20k, full_buy ≥20k
- **01-03**: Calculate attack/defense splits assuming first 12 rounds on one side
- **01-04**: Next.js unstable_cache with tag-based invalidation for 24-hour TTL
- **01-04**: Cache metadata table tracks fetch timestamps and expiry for monitoring
- **01-04**: Server Actions trigger Edge Functions and invalidate cache tags
- **01-04**: @supabase/ssr for proper cookie handling in Server Components
- **02-01**: Database functions (PL/pgSQL) for aggregations instead of application-layer code (10-100x performance)
- **02-01**: FILTER clause for conditional aggregation - single table scan instead of multiple queries
- **02-01**: JSONB return type for combined summary function - flexible schema evolution
- **02-01**: NULL handling with NULLIF() for denominators, COALESCE() for defaults
- **02-02**: Window functions (AVG OVER, LAG) for time-series analytics and performance trends
- **02-02**: Return NULL for clutch 1v1/1v2/1v3+ breakdowns (lumina schema doesn't track opponent count)
- **02-02**: FILTER clause for KAST calculation (kills > 0 OR assists > 0 OR deaths = 0 OR traded)
- **02-02**: JSONB aggregation (jsonb_agg, jsonb_build_object) for team players summary
- **02-03**: JSONB for composition storage - sorted agent arrays enable composition signatures for grouping
- **02-03**: Window functions for meta timeline - LAG() detects composition changes, COUNT OVER for consecutive uses
- **02-03**: Agent role classification - hardcoded current VALORANT agent roles (duelist, controller, initiator, sentinel)
- **02-03**: Site attack logic - uses spike_events with event_type='plant' to determine site preferences
- **02-03**: Map pool thresholds - >60% win rate = strength, <40% = weakness, 40-60% = neutral
- **02-03**: Fixed AnalyticsFilters to require teamId - composition and map analytics always need team context
- **02-04**: Materialized views over real-time aggregations - <1s query time vs 5-10s function execution
- **02-04**: CONCURRENTLY refresh with UNIQUE indexes - zero-downtime view updates
- **02-04**: Lumina ETL schema (001_lumina_schema.sql) as base - shared data from separate lumina project
- **02-04**: Bug fixes applied automatically (Rule 1) - type casting, jsonb_agg ORDER BY syntax
- **02-05**: TeamStrategiesSummary.site_preferences uses Record<string, SitePreference[]> to match JSONB map structure (REVERSED in 02-06)
- **02-05**: AnalyticsFilters.mapName is optional to support both filtered and unfiltered queries
- **02-06**: TypeScript field names corrected to match Lumina SQL RETURNS TABLE definitions (pattern_type, occurrences, avg_plant_time, avg_loadout_value, attacks, preference_pct)
- **02-06**: TeamStrategiesSummary.site_preferences is SitePreference[] (flat array) - SQL returns jsonb_agg, not grouped object
- **02-06**: JSONB array comments added to composition types for clarity
- **02-07**: CREATE OR REPLACE FUNCTION for non-destructive schema fixes (preserves git history)
- **02-07**: CARDINALITY(p_series_ids) = 0 pattern for optional array parameters meaning "all items"
- **02-07**: Lumina schema uses rounds.phase = 'pistol' for pistol round detection (not round_number = 0)
- **02-07**: Lumina spike_events uses game_time_ms (milliseconds) - convert with / 1000.0 for seconds
- **03-01**: Next.js unstable_cache over Redis - built-in caching with tag-based invalidation, no infrastructure overhead
- **03-01**: Next.js 16.1 revalidateTag requires two arguments (tag, profile) - API breaking change from Next.js 15
- **03-01**: ReportSection<T> wraps each section with status - enables graceful degradation on partial failures
- **03-02**: Promise.allSettled over Promise.all - graceful degradation allows partial report success
- **03-02**: 55s internal timeout with 60s maxDuration - 5s buffer for response serialization
- **03-02**: AbortController with { once: true } cleanup pattern per RESEARCH.md findings
- **03-02**: Single batch for 4 cached analytics functions - no need for chunking since functions are cached
- **03-03**: Sequential execution (not parallel) for meaningful progress stages - 4 functions × ~10-15s = ~50s total (under 60s Vercel limit)
- **03-03**: SSE over WebSockets - simpler for unidirectional streaming, built-in auto-reconnect
- **03-03**: Text-based stage messages without percentage bars - variable execution times make percentages misleading
- **03-04**: Sequential cache warming (not parallel) to avoid overwhelming database with concurrent queries
- **03-04**: warmTopTeams() slices first N teams from alphabetically sorted getTeams() - deterministic subset
- **03-04**: Benchmark script tests Server Action (parallel batch) - SSE inherits same cached functions
- **04-01**: shadcn/ui over other component libraries - accessible, keyboard-navigable, themeable with CSS variables
- **04-01**: nuqs for URL state management - type-safe, SSR-friendly, shareable URLs
- **04-01**: Skeleton dimensions match final content - prevents layout shift on load (h-10 for filters, h-6 for headings)
- **04-01**: Tuple type overload for executeBatch - supports heterogeneous analytics functions
- **04-01**: Cache + cookies pattern - createServerClient() outside unstable_cache() to avoid Next.js dynamic data restrictions
- **04-02**: Combobox pattern (Popover + Command) for searchable dropdowns with keyboard navigation
- **04-02**: Match count default 10, options 5/10/15/20/All (0) as button group with active state
- **04-02**: lib/supabase/server.ts copy to resolve @/ path alias issues in cached functions
- **04-03**: Date range uses from/to ISO date params in URL - parseAsIsoDate from nuqs
- **04-03**: Tournament and map filters use id/name params respectively in URL state
- **04-03**: Active filters only show for non-default values (matchCount displays only if not 10)
- **04-03**: Clear all button appears when 2+ filters active
- **04-03**: Date range calendar shows 2 months (numberOfMonths=2) for better UX

### Pending Todos

None yet.

### Blockers/Concerns

**GRID API schema validation (01-02, 01-03):**
- GraphQL queries use presumed field names (shortName, logoUrl, nickname, rounds, kills, economy) - actual GRID schema may differ
- **Impact:** Queries may fail or return incomplete data until tested with real API
- **Mitigation:** Edge Functions handle schema mismatches gracefully, normalizers accept undefined fields
- **Action required:** Test fetch-teams, fetch-matches, and fetch-round-events with real GRID API, adjust queries via introspection if needed

**Phase 2 Complete (2026-01-30):**
- All 18 Mosaic analytics functions deployed and schema-compatible with Lumina database
- TypeScript types aligned with SQL RETURNS TABLE definitions
- Materialized views and indexes implemented for <10s performance target
- Verification PASSED (6/6 must-haves verified)

**Phase 3 Complete (2026-01-30):**
- 03-01: Caching layer (4 analytics functions wrapped with unstable_cache)
- 03-02: Report orchestrator (generateReport Server Action with 60s timeout and graceful degradation)
- 03-03: SSE streaming endpoint with progress updates and client component
- 03-04: Performance validation and cache warming utilities (<60s cold cache confirmed)
- All report generation infrastructure ready for UI implementation

**Phase 4 Progress (2026-01-30):**
- 04-01: UI foundation complete - shadcn/ui components (command, popover, calendar, badge), nuqs, content-shaped skeletons
- 04-02: Team selector and match count selector - searchable dropdown with URL state sync
- 04-03: Advanced filters complete - date range (calendar), tournament, map dropdowns with active filter chips
- All filter state persisted in URL: team, matchCount, tournament, map, from, to
- Ready for 04-04 (Generate Report Button)

None critical. Phases 1-3 complete. Phase 4 almost complete (3/4 plans).

## Session Continuity

Last session: 2026-01-30 (plan execution)
Stopped at: Completed 04-03-PLAN.md - Advanced filters (date range, tournament, map)
Resume file: None

---
*State initialized: 2026-01-28*
*Last updated: 2026-01-30 (04-03 complete - Phase 4 almost complete)*
