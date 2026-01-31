# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Reduce pre-match scouting from 8+ hours of manual VOD review to under 90 seconds of automated, data-driven analysis — while increasing depth and consistency.
**Current focus:** Phase 6 - Counter-Strategies & Shareability

## Current Position

Phase: 6 of 6 (Counter-Strategies & Shareability)
Plan: 06 of 6 in phase (COMPLETE)
Status: Phase complete - All functionality delivered
Last activity: 2026-01-30 — Completed 06-06-PLAN.md (seriesIds pipeline closure)

Progress: [████████████████████████████████] 100% (29/29 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 29
- Average duration: 3.8 min
- Total execution time: 1.85 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-data-foundation-grid-integration | 4 | 24min | 6min |
| 02-analytics-engine-aggregation | 7 | 37min | 5min |
| 03-report-generation-orchestration | 4 | 15min | 3.75min |
| 04-report-interface-team-selection | 4 | 15min | 3.75min |
| 05-report-visualization-output | 5 | 14min | 2.8min |
| 06-counter-strategies-shareability | 6 | 16.6min | 2.8min |

**Recent Trend:**
- Last 5 plans: 2min, 2.8min, 2min, 4.6min, 2min
- Trend: Excellent (averaging 2.7min over last 5)

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
- **04-04**: parseAsStringLiteral for tab state - type-safe URL sync with literal union type
- **04-04**: SectionContent helper pattern - handles success/failed/skipped status for graceful degradation
- **04-04**: Raw JSON display for Phase 4 - visualizations deferred to Phase 5
- **04-04**: Counter-strategies tab placeholder - structure in place for Phase 6 content
- **04-04**: Fixed snake_case property names (Rule 1) - analytics types use pistol_patterns, player_name, map_name (not camelCase)
- **05-01**: Recharts via shadcn chart components - declarative API, accessible, themeable with CSS variables
- **05-01**: StatCard with invertTrend prop for metrics where lower is better (deaths, losses)
- **05-01**: DataFreshness handles both Date objects and ISO strings for flexibility
- **05-02**: Y-axis domain [0, 100] for percentage charts to avoid truncation (per RESEARCH.md pitfalls)
- **05-02**: Configurable maxAgents/maxComps to prevent chart clutter (default 5)
- **05-02**: Dual Y-axis pattern for mixed scale metrics (CompositionFrequencyChart: games_played left, win_rate right)
- **05-02**: Composition legend below chart (agent names too long for X-axis labels)
- **05-02**: Empty state pattern for all charts (flex center, border, bg-muted/10, text-muted-foreground)
- **05-04**: Programmatic insight generation from report analytics (map strengths/weaknesses, site preferences, economy patterns, star player)
- **05-04**: Heuristic significance scoring (high: 70%+ win rate / 25%+ above avg, medium: 60-70% / 15-25%, low: <60% / <15%)
- **05-04**: Top 3 insights display limit to avoid information overload
- **05-04**: Pistol pattern cards with color-coded win rate badges
- **05-04**: Human-readable labels for pistol patterns (Fast Execute, Default Setup, No Plant)
- **05-05**: Player sorting by ACS descending for default ranking display
- **05-05**: Comparison badges show percentage above/below team average, hidden if <5% difference
- **05-05**: Green color coding for above-average stats (higher is better for ACS, K/D, KAST)
- **05-05**: Dual display pattern - ranking table for quick comparison + detail cards for individual analysis
- **05-06**: CompositionsSection shows top 6 compositions in grid layout with chart integration
- **05-06**: MapsSection stat cards display overall metrics (maps played, total games, avg rounds)
- **05-06**: Strength/weakness thresholds match established patterns (60%/40% from map pool analysis)
- **05-06**: ExecutiveSummary appears above all tabs for immediate insight access
- **05-06**: DataFreshness footer optional via metadata prop (supports both with/without metadata usage)
- **05-06**: Consistent empty state styling (bg-muted/10, text-muted-foreground) across all components
- **06-02**: Icon selection by pattern type (Clock for timing, TrendingDown for economy, Target for default)
- **06-02**: Three-section layout for counter-strategies (Top Recommendations, Exploitable Weaknesses, Predictable Tendencies)
- **06-02**: Data quality notice appears when has_sufficient_data is false
- **06-03**: nanoid(10) for collision-resistant short URLs (6M IDs at 1% collision probability)
- **06-03**: JSONB storage for complete ScoutingReport - flexible schema, single-query retrieval
- **06-03**: 90-day snapshot expiration with database-level cleanup function
- **06-03**: createServerClient for cookie-based auth in Server Actions
- **06-04**: ShareButton auto-generates link on dialog open (no separate Generate button needed)
- **06-04**: Share button hidden when viewing a snapshot (isSnapshot prop prevents re-sharing)
- **06-04**: Snapshot loading uses useSearchParams to detect snapshot param in URL
- **06-04**: Early return pattern for snapshot view - bypasses live report generation UI
- **06-04**: Alert banner displays snapshot creation date for context
- **06-06**: ScoutingReport seriesIds field as required (not optional) for type-safe data flow
- **06-06**: Both SSE and Server Action endpoints populate seriesIds from params (consistent across generation methods)

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

**Phase 4 Complete (2026-01-30):**
- 04-01: UI foundation - shadcn/ui components (command, popover, calendar, badge, tabs), nuqs, content-shaped skeletons
- 04-02: Team selector and match count selector - searchable dropdown with URL state sync
- 04-03: Advanced filters - date range (calendar), tournament, map dropdowns with active filter chips
- 04-04: Tabbed report interface - 5 tabs with URL-synced navigation, section status handling, full generation workflow
- Complete report interface: filters -> generate -> tabs -> display
- All state persisted in URL: team, matchCount, tournament, map, from, to, tab

**Phase 5 Complete (2026-01-30):**
- 05-01: Chart foundation - shadcn chart components (ChartContainer, ChartTooltip, ChartLegend), StatCard, DataFreshness
- 05-02: Bar chart visualizations - AgentPickRateChart, SitePreferenceChart, CompositionFrequencyChart
- 05-03: Line chart visualizations - EconomyPatternChart with dual Y-axis pattern
- 05-04: Report section components - ExecutiveSummary with auto-generated insights, StrategiesSection combining visualizations
- 05-05: Player performance section - PlayersSection with rankings table and comparison badges
- 05-06: Final report integration - CompositionsSection, MapsSection, complete report display with all visualizations
- Recharts installed as chart library
- Bar/line chart patterns established (accessibilityLayer, empty state handling, Y-axis domain configuration)
- Insight generation pattern established (threshold-based heuristics with data backing)
- All report visualization components complete and integrated
- ExecutiveSummary always-visible at top of reports
- DataFreshness footer displays metadata when available

**Phase 6 Complete (2026-01-30):**
- 06-01: Counter-strategy detection - generateCounterStrategies function with exploitable patterns and timing patterns
- 06-02: Counter-strategies UI - CounterStrategiesSection with confidence badges and low-sample-size warnings
- 06-03: Snapshot infrastructure - report_snapshots table with JSONB storage, nanoid-based short URLs, 90-day expiration
- 06-04: Share button & snapshot loading - ShareButton component with Dialog UI, snapshot loading via URL params
- 06-05: Trend analysis - Meta timeline chart showing composition evolution over time
- 06-06: SeriesIds pipeline - Complete data flow from request to snapshot (gap closure)
- ShareButton receives actual series IDs for accurate snapshot creation
- All counter-strategies and shareability features implemented

**PROJECT COMPLETE:** All 6 phases delivered (29 plans + 1 gap closure). Scouting report system fully operational from data ingestion to shareable visualizations.

## Session Continuity

Last session: 2026-01-30 (plan execution)
Stopped at: Completed 06-06-PLAN.md - SeriesIds pipeline gap closure (Phase 6 COMPLETE)
Resume file: None

---
*State initialized: 2026-01-28*
*Last updated: 2026-01-30 (Phase 6 COMPLETE - All plans delivered)*
