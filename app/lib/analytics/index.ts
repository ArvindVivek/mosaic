// Re-export all analytics modules for convenient imports
// Usage: import { getTeamStrategiesSummary, getPlayerCoreStats } from '@/app/lib/analytics';

// Types
export * from './types';

// Team Strategy Functions
export {
  getTeamAttackPistolPatterns,
  getTeamEconomyPatterns,
  getTeamSitePreferences,
  getTeamStrategiesSummary,
} from './team-strategies';

// Player Analytics Functions
export {
  getPlayerCoreStats,
  getPlayerAgentPool,
  getPlayerFirstBloodStats,
  getPlayerClutchStats,
  getPlayerPerformanceTrend,
  getTeamPlayersSummary,
} from './player-tendencies';

// Composition Analytics Functions
export {
  getTeamCompositions,
  getCompositionWinRatesByMap,
  getMetaAdaptationTimeline,
  getRoleDistribution,
} from './compositions';

// Map Analytics Functions
export {
  getMapWinRates,
  getMapCompositionPreferences,
  getMapSitePatterns,
  getMapPoolAnalysis,
} from './map-performance';

// Refresh Functions
export {
  refreshAnalyticsViews,
  shouldRefreshViews,
  type RefreshResult,
} from './refresh';
