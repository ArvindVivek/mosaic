# Supabase Refactor - Mosaic Analytics

## What Changed

Mosaic now uses the **shared Lumina Supabase instance** with its own `mosaic` schema for analytics, following the same pattern as Synapse (which uses the `synapse` schema).

### Architecture

```
Lumina Supabase (single instance - port 54321)
├── public schema        → Lumina VCT data (teams, players, matches, rounds, events)
├── synapse schema       → Synapse LoL analytics
└── mosaic schema        → Mosaic VALORANT scouting analytics (NEW)
```

## Changes Made

### 1. Removed Standalone Supabase

- **Deleted**: `mosaic/supabase/` folder
- **Backed up**: Original migrations at `mosaic/.backup_migrations/`

### 2. Updated Lumina Config

**File**: `lumina/supabase/config.toml`

```toml
# Line 14 - Added mosaic to exposed schemas
schemas = ["public", "synapse", "mosaic", "graphql_public"]
```

### 3. Created Mosaic Schema Migrations

**Location**: `lumina/supabase/migrations/`

All Mosaic analytics migrations added with proper schema isolation:

- `20260129000010_mosaic_team_strategies.sql` - Team strategy functions (pistol patterns, economy, site preferences)
- `20260129000011_mosaic_player_analytics.sql` - Player analytics functions (ACS, K/D, agent pools, clutch stats)
- `20260129000012_mosaic_composition_map.sql` - Composition and map analytics functions
- `20260129000013_mosaic_materialized_views.sql` - Pre-computed analytics views
- `20260129000014_mosaic_indexes.sql` - Performance indexes

### 4. Schema Isolation

All Mosaic database objects are prefixed with `mosaic.`:

**Functions** (14 total):
- `mosaic.get_team_attack_pistol_patterns()`
- `mosaic.get_team_economy_patterns()`
- `mosaic.get_player_core_stats()`
- `mosaic.get_player_agent_pool()`
- ... (and 10 more)

**Materialized Views** (4 total):
- `mosaic.mv_player_core_stats`
- `mosaic.mv_player_agent_pool`
- `mosaic.mv_team_map_stats`
- `mosaic.mv_team_compositions`

**Indexes** (19 total):
- `mosaic_mv_player_core_stats_unique`
- `mosaic_mv_player_agent_pool_unique`
- ... (and 17 more)

All functions reference Lumina data with `public.` prefix:
- `public.players`
- `public.teams`
- `public.rounds`
- `public.games`
- `public.series`
- `public.player_round_stats`
- `public.kill_events`
- `public.spike_events`

## Applying Migrations

### Option 1: Via Supabase Studio (Recommended)

1. Navigate to Lumina Supabase Studio: http://127.0.0.1:54323
2. Go to SQL Editor
3. Run each migration file in order:
   - 20260129000010_mosaic_team_strategies.sql
   - 20260129000011_mosaic_player_analytics.sql
   - 20260129000012_mosaic_composition_map.sql
   - 20260129000013_mosaic_materialized_views.sql
   - 20260129000014_mosaic_indexes.sql

### Option 2: Via CLI

```bash
cd /Users/arvind/Documents/Hackathons/Cloud9\ x\ JetBrains\ 2026/lumina
supabase db reset  # This will apply all migrations including the new mosaic ones
```

### Option 3: Via psql

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

-- In psql, run each migration file
\i lumina/supabase/migrations/20260129000010_mosaic_team_strategies.sql
\i lumina/supabase/migrations/20260129000011_mosaic_player_analytics.sql
\i lumina/supabase/migrations/20260129000012_mosaic_composition_map.sql
\i lumina/supabase/migrations/20260129000013_mosaic_materialized_views.sql
\i lumina/supabase/migrations/20260129000014_mosaic_indexes.sql
```

## Verifying the Setup

### 1. Check Schema Exists

```sql
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mosaic';
```

Expected: 1 row showing 'mosaic'

### 2. Check Functions

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'mosaic'
ORDER BY routine_name;
```

Expected: 15 functions (14 analytics + 1 refresh function)

### 3. Check Materialized Views

```sql
SELECT schemaname, matviewname
FROM pg_matviews
WHERE schemaname = 'mosaic';
```

Expected: 4 materialized views

### 4. Test a Function

```sql
-- Get team strategies for any team
SELECT mosaic.get_team_strategies_summary(
  'team-id-from-lumina',
  ARRAY['series-id-1', 'series-id-2']::TEXT[]
);
```

### 5. Test from Mosaic Next.js

Create a test API route in Mosaic:

**File**: `mosaic/app/api/test-analytics/route.ts`

```typescript
import { createServerClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerClient();

  // Test fetching from public schema (Lumina data)
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .limit(5);

  // Test calling mosaic schema function
  const { data: analytics, error: analyticsError } = await supabase
    .rpc('mosaic.get_team_strategies_summary', {
      p_team_id: teams?.[0]?.id || 'test-id',
      p_series_ids: []
    });

  return NextResponse.json({
    teams: teams?.length || 0,
    teamsError,
    analytics,
    analyticsError,
    message: 'Mosaic analytics connected to Lumina Supabase'
  });
}
```

Then visit: http://localhost:3000/api/test-analytics

## Mosaic TypeScript Analytics Usage

All TypeScript query helpers in Mosaic are already configured to call the `mosaic.` schema functions:

**Example**:

```typescript
import { getTeamStrategiesSummary } from '@/app/lib/analytics/team-strategies';

const strategies = await getTeamStrategiesSummary({
  teamId: 'team-123',
  seriesIds: ['series-1', 'series-2']
});
```

This will call `mosaic.get_team_strategies_summary()` which queries `public.teams`, `public.rounds`, etc. from Lumina.

## Cleanup

Once migrations are verified:

```bash
# Remove backup migrations from Mosaic
rm -rf /Users/arvind/Documents/Hackathons/Cloud9\ x\ JetBrains\ 2026/mosaic/.backup_migrations
```

## Troubleshooting

### "function mosaic.get_... does not exist"

- Migrations not applied yet. Run migrations via Supabase Studio or CLI.

### "relation public.teams does not exist"

- Lumina schema not loaded. Check that Lumina's base migrations (001_schema.sql) are applied.

### Connection refused on port 54321

- Lumina Supabase not running. Start it from the Lumina project folder.

### RPC calls return "permission denied"

- Check that GRANT EXECUTE permissions are in the migrations (they are).
- Verify the Supabase anon key has access to the `mosaic` schema (exposed in config.toml line 14).

## Next Steps

After verifying migrations:

1. Test all analytics functions with real Lumina data
2. Execute gap closure plan 02-05 to add missing TypeScript types
3. Re-run verification to confirm Phase 2 complete
4. Continue to Phase 3 (Report Generation & Orchestration)

---

**Refactored**: 2026-01-29
**Status**: Awaiting migration application and testing
