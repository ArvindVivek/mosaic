// TypeScript query helpers for player analytics database functions
// Invokes PostgreSQL functions via (supabase.rpc as any)() from Next.js Server Components

import { createServiceClient } from '@/app/lib/supabase/server';
import type {
  PlayerCoreStats,
  PlayerAgentStats,
  FirstBloodStats,
  ClutchStats,
  PerformanceTrendPoint,
  TeamPlayerSummary,
  PlayerFilters,
  AnalyticsFilters,
} from './types';

// =============================================================================
// Player Core Stats (PLAYER-01)
// =============================================================================
export async function getPlayerCoreStats(
  filters: PlayerFilters
): Promise<PlayerCoreStats | null> {
  const supabase = createServiceClient();

  const { data, error } = await (supabase.rpc as any)('get_player_core_stats', {
    p_player_id: filters.playerId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch player core stats: ${error.message}`);
  }

  // Function returns array, we want first element
  return data?.[0] ?? null;
}

// =============================================================================
// Player Agent Pool (PLAYER-02, PLAYER-03)
// =============================================================================
export async function getPlayerAgentPool(
  filters: PlayerFilters
): Promise<PlayerAgentStats[]> {
  const supabase = createServiceClient();

  const { data, error } = await (supabase.rpc as any)('get_player_agent_pool', {
    p_player_id: filters.playerId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch player agent pool: ${error.message}`);
  }

  return data ?? [];
}

// =============================================================================
// Player First Blood Stats (PLAYER-04, PLAYER-05)
// =============================================================================
export async function getPlayerFirstBloodStats(
  filters: PlayerFilters
): Promise<FirstBloodStats | null> {
  const supabase = createServiceClient();

  const { data, error } = await (supabase.rpc as any)('get_player_first_blood_stats', {
    p_player_id: filters.playerId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch player first blood stats: ${error.message}`);
  }

  // Function returns array, we want first element
  return data?.[0] ?? null;
}

// =============================================================================
// Player Clutch Stats (PLAYER-06)
// =============================================================================
export async function getPlayerClutchStats(
  filters: PlayerFilters
): Promise<ClutchStats | null> {
  const supabase = createServiceClient();

  const { data, error } = await (supabase.rpc as any)('get_player_clutch_stats', {
    p_player_id: filters.playerId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch player clutch stats: ${error.message}`);
  }

  // Function returns array, we want first element
  return data?.[0] ?? null;
}

// =============================================================================
// Player Performance Trend (PLAYER-07)
// =============================================================================
export async function getPlayerPerformanceTrend(
  filters: PlayerFilters
): Promise<PerformanceTrendPoint[]> {
  const supabase = createServiceClient();

  const { data, error } = await (supabase.rpc as any)('get_player_performance_trend', {
    p_player_id: filters.playerId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch player performance trend: ${error.message}`);
  }

  return data ?? [];
}

// =============================================================================
// Team Players Summary
// =============================================================================
export async function getTeamPlayersSummary(
  filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>
): Promise<TeamPlayerSummary[]> {
  const supabase = createServiceClient();

  if (!filters.teamId) {
    throw new Error('teamId is required for team players summary');
  }

  const { data, error } = await (supabase.rpc as any)('get_team_players_summary', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch team players summary: ${error.message}`);
  }

  // Function returns JSONB, parse if needed
  return data ?? [];
}
