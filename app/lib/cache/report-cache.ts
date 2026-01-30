// Cache wrapper utilities for report generation
// Wraps analytics functions with 24-hour TTL using Next.js unstable_cache

import { unstable_cache, revalidateTag } from 'next/cache';
import {
  getTeamStrategiesSummary,
  getTeamPlayersSummary,
  getTeamCompositions,
  getMapWinRates,
} from '@/app/lib/analytics';
import type { AnalyticsFilters } from '@/app/lib/analytics/types';

// =============================================================================
// Cache Tags
// =============================================================================

export const CACHE_TAGS = {
  analytics: 'analytics',
  teamStrategies: 'team-strategies',
  teamPlayers: 'team-players',
  compositions: 'compositions',
  maps: 'maps',
} as const;

// =============================================================================
// Cached Analytics Functions
// =============================================================================

/**
 * Cached wrapper for getTeamStrategiesSummary
 * Returns pistol patterns, economy patterns, and site preferences
 * Cache: 24 hours, tags: ['analytics', 'team-strategies']
 */
export const getCachedTeamStrategies = unstable_cache(
  async (filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>) => {
    return getTeamStrategiesSummary(filters);
  },
  ['team-strategies'],
  { tags: [CACHE_TAGS.analytics, CACHE_TAGS.teamStrategies], revalidate: 86400 }
);

/**
 * Cached wrapper for getTeamPlayersSummary
 * Returns aggregated player stats (ACS, K/D, KAST, top agents)
 * Cache: 24 hours, tags: ['analytics', 'team-players']
 */
export const getCachedPlayersSummary = unstable_cache(
  async (filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>) => {
    return getTeamPlayersSummary(filters);
  },
  ['team-players'],
  { tags: [CACHE_TAGS.analytics, CACHE_TAGS.teamPlayers], revalidate: 86400 }
);

/**
 * Cached wrapper for getTeamCompositions
 * Returns team composition usage stats with win rates
 * Cache: 24 hours, tags: ['analytics', 'compositions']
 */
export const getCachedCompositions = unstable_cache(
  async (filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>) => {
    return getTeamCompositions(filters);
  },
  ['team-compositions'],
  { tags: [CACHE_TAGS.analytics, CACHE_TAGS.compositions], revalidate: 86400 }
);

/**
 * Cached wrapper for getMapWinRates
 * Returns per-map performance with win/loss stats
 * Cache: 24 hours, tags: ['analytics', 'maps']
 */
export const getCachedMapPerformance = unstable_cache(
  async (filters: Pick<AnalyticsFilters, 'teamId' | 'seriesIds'>) => {
    return getMapWinRates(filters);
  },
  ['map-win-rates'],
  { tags: [CACHE_TAGS.analytics, CACHE_TAGS.maps], revalidate: 86400 }
);

// =============================================================================
// Cache Invalidation Helpers
// =============================================================================

/**
 * Invalidate report cache for a team
 * Clears all analytics cache tags to force fresh data fetch
 *
 * @param teamId - Optional team ID for future granular invalidation
 */
export async function invalidateReportCache(teamId?: string): Promise<void> {
  // Revalidate all analytics tags (Next.js 16.1 requires profile as second argument)
  revalidateTag(CACHE_TAGS.analytics, 'default');
  revalidateTag(CACHE_TAGS.teamStrategies, 'default');
  revalidateTag(CACHE_TAGS.teamPlayers, 'default');
  revalidateTag(CACHE_TAGS.compositions, 'default');
  revalidateTag(CACHE_TAGS.maps, 'default');

  // TODO: If needed, implement team-specific tag invalidation
  // Example: revalidateTag(`team-${teamId}`, 'default')
  // Requires updating cached function tags to include team ID
}
