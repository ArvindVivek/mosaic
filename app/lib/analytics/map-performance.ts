// TypeScript query helpers for map analytics
// Invokes database functions via (supabase.rpc as any)()

import { createServiceClient } from '@/app/lib/supabase/server';
import type {
  MapWinRate,
  MapCompositionPreference,
  MapSitePattern,
  MapPoolAnalysis,
  MapFilters,
  AnalyticsFilters,
} from './types';

export async function getMapWinRates(
  filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>
): Promise<MapWinRate[]> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase.rpc as any)('get_map_win_rates', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });
  if (error) throw new Error(`Failed to fetch map win rates: ${error.message}`);
  return data ?? [];
}

export async function getMapCompositionPreferences(
  filters: MapFilters
): Promise<MapCompositionPreference[]> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase.rpc as any)('get_map_composition_preferences', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
    p_map_name: filters.mapName,
  });
  if (error) throw new Error(`Failed to fetch map compositions: ${error.message}`);
  return (data ?? []).map((d: Record<string, unknown>) => ({
    ...d,
    composition: d.composition as string[],
  })) as MapCompositionPreference[];
}

export async function getMapSitePatterns(
  filters: MapFilters
): Promise<MapSitePattern[]> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase.rpc as any)('get_map_site_patterns', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
    p_map_name: filters.mapName,
  });
  if (error) throw new Error(`Failed to fetch site patterns: ${error.message}`);
  return data ?? [];
}

export async function getMapPoolAnalysis(
  filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>
): Promise<MapPoolAnalysis> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase.rpc as any)('get_map_pool_analysis', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });
  if (error) throw new Error(`Failed to fetch map pool analysis: ${error.message}`);
  return data;
}
