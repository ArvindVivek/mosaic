// TypeScript query helpers for composition analytics
// Invokes database functions via (supabase.rpc as any)()

import { createServiceClient } from '@/app/lib/supabase/server';
import type {
  CompositionStats,
  CompositionMapStats,
  MetaAdaptationPoint,
  RoleDistribution,
  CompositionFilters,
} from './types';

export async function getTeamCompositions(
  filters: Pick<CompositionFilters, 'teamId' | 'seriesIds'>
): Promise<CompositionStats[]> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase.rpc as any)('get_team_compositions', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });
  if (error) throw new Error(`Failed to fetch compositions: ${error.message}`);
  return (data ?? []).map((d: Record<string, unknown>) => ({
    ...d,
    composition: d.composition as string[], // JSONB comes as array
  })) as CompositionStats[];
}

export async function getCompositionWinRatesByMap(
  filters: Pick<CompositionFilters, 'teamId' | 'seriesIds'>
): Promise<CompositionMapStats[]> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase.rpc as any)('get_composition_win_rates_by_map', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });
  if (error) throw new Error(`Failed to fetch composition map stats: ${error.message}`);
  return (data ?? []).map((d: Record<string, unknown>) => ({
    ...d,
    composition: d.composition as string[],
  })) as CompositionMapStats[];
}

export async function getMetaAdaptationTimeline(
  filters: Pick<CompositionFilters, 'teamId' | 'seriesIds'>
): Promise<MetaAdaptationPoint[]> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase.rpc as any)('get_meta_adaptation_timeline', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });
  if (error) throw new Error(`Failed to fetch meta timeline: ${error.message}`);
  return (data ?? []).map((d: Record<string, unknown>) => ({
    ...d,
    composition: d.composition as string[],
  })) as MetaAdaptationPoint[];
}

export async function getRoleDistribution(
  filters: Pick<CompositionFilters, 'teamId' | 'seriesIds'>
): Promise<RoleDistribution[]> {
  const supabase = createServiceClient();
  const { data, error } = await (supabase.rpc as any)('get_role_distribution', {
    p_team_id: filters.teamId,
    p_series_ids: filters.seriesIds,
  });
  if (error) throw new Error(`Failed to fetch role distribution: ${error.message}`);
  return data ?? [];
}
