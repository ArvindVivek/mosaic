// Direct pass-through to analytics functions - NO CACHING
// Caching disabled for fresh data on every request (Vercel production testing)

import {
  getTeamStrategiesSummary,
  getTeamPlayersSummary,
  getTeamCompositions,
  getMapWinRates,
} from '@/app/lib/analytics';
import type { AnalyticsFilters } from '@/app/lib/analytics/types';

// =============================================================================
// Direct Analytics Functions (No Cache)
// =============================================================================

/**
 * Direct wrapper for getTeamStrategiesSummary - NO CACHE
 */
export const getCachedTeamStrategies = async (filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>) => {
  return getTeamStrategiesSummary(filters);
};

/**
 * Direct wrapper for getTeamPlayersSummary - NO CACHE
 */
export const getCachedPlayersSummary = async (filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>) => {
  return getTeamPlayersSummary(filters);
};

/**
 * Direct wrapper for getTeamCompositions - NO CACHE
 */
export const getCachedCompositions = async (filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>) => {
  return getTeamCompositions(filters);
};

/**
 * Direct wrapper for getMapWinRates - NO CACHE
 */
export const getCachedMapPerformance = async (filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>) => {
  return getMapWinRates(filters);
};

// =============================================================================
// Cache Invalidation (No-op - caching disabled)
// =============================================================================

/**
 * No-op function - caching disabled
 */
export async function invalidateReportCache(teamId?: string): Promise<void> {
  // No-op - caching disabled
  // Requires updating cached function tags to include team ID
}
