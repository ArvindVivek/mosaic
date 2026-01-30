// Team strategy analytics query helpers
// Invokes database functions via supabase.rpc() for team strategy analysis

import { createServiceClient } from '@/app/lib/supabase/server';
import type {
  PistolPattern,
  EconomyPattern,
  SitePreference,
  TeamStrategiesSummary,
  AnalyticsFilters
} from './types';

/**
 * Get attack-side pistol round patterns
 * Analyzes pistol rounds (0, 12) to classify strategies and calculate success rates
 *
 * @param filters - Team ID and series IDs to analyze
 * @returns Array of pistol patterns with strategy types and success rates
 */
export async function getTeamAttackPistolPatterns(
  filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>
): Promise<PistolPattern[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('get_team_attack_pistol_patterns', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch pistol patterns: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Get economy pattern analysis
 * Analyzes win rates and spending patterns across economy types
 *
 * @param filters - Team ID and series IDs to analyze
 * @returns Array of economy patterns with win rates by buy type
 */
export async function getTeamEconomyPatterns(
  filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>
): Promise<EconomyPattern[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('get_team_economy_patterns', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch economy patterns: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Get site attack preferences
 * Analyzes spike plant locations to determine site preferences by map
 *
 * @param filters - Team ID, series IDs, and optional map name filter
 * @returns Array of site preferences with plant distribution and success rates
 */
export async function getTeamSitePreferences(
  filters: AnalyticsFilters
): Promise<SitePreference[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('get_team_site_preferences', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
    p_map_name: filters.mapName ?? null,
  });

  if (error) {
    throw new Error(`Failed to fetch site preferences: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Get combined team strategies summary
 * Returns aggregated results from all strategy functions in single JSONB response
 *
 * @param filters - Team ID and series IDs to analyze
 * @returns Combined summary with pistol patterns, economy patterns, and site preferences
 */
export async function getTeamStrategiesSummary(
  filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>
): Promise<TeamStrategiesSummary> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('get_team_strategies_summary', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });

  if (error) {
    throw new Error(`Failed to fetch strategies summary: ${error.message}`);
  }

  return data as TeamStrategiesSummary;
}
