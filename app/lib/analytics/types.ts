// TypeScript types for player analytics
// These types match the database function return types from 003_player_analytics_functions.sql

// =============================================================================
// Player Core Metrics (PLAYER-01)
// =============================================================================
export interface PlayerCoreStats {
  player_id: string;
  player_name: string;
  rounds_played: number;
  acs: number;            // Average Combat Score
  kd_ratio: number;       // Kill/Death ratio
  adr: number;            // Average Damage per Round
  headshot_pct: number;   // Headshot percentage
  kast_pct: number;       // Kill/Assist/Survived/Traded percentage
}

// =============================================================================
// Player Agent Pool (PLAYER-02, PLAYER-03)
// =============================================================================
export interface PlayerAgentStats {
  agent: string;
  games_played: number;
  rounds_played: number;
  pick_rate: number;      // % of player's games on this agent
  win_rate: number;       // Round win rate on this agent
  avg_acs: number;        // Average ACS on this agent
}

// =============================================================================
// First Blood Statistics (PLAYER-04, PLAYER-05)
// =============================================================================
export interface FirstBloodStats {
  first_kill_attempts: number;  // Rounds where player got first kill or first death
  first_kills: number;           // From player_round_stats.first_kill = true
  first_deaths: number;          // From player_round_stats.first_death = true
  fk_rate: number;               // first_kills / first_kill_attempts * 100
  fd_rate: number;               // first_deaths / total_rounds * 100
  fk_fd_diff: number;            // fk_rate - fd_rate
}

// =============================================================================
// Clutch Statistics (PLAYER-06)
// =============================================================================
export interface ClutchStats {
  clutch_situations: number;     // clutch_situation = true count
  clutch_wins: number;           // clutch_won = true count
  clutch_win_rate: number;       // clutch_wins / clutch_situations * 100
  clutch_1v1_wins: number | null;      // Not tracked in current schema
  clutch_1v2_wins: number | null;      // Not tracked in current schema
  clutch_1v3_plus_wins: number | null; // Not tracked in current schema
}

// =============================================================================
// Performance Trend Point (PLAYER-07)
// =============================================================================
export interface PerformanceTrendPoint {
  series_id: string;
  series_date: string;           // Timestamp from database
  acs: number;
  acs_moving_avg: number;        // 3-series moving average
  performance_trend: 'improving' | 'declining' | 'stable';
}

// =============================================================================
// Team Player Summary
// =============================================================================
export interface TeamPlayerSummary {
  player_id: string;
  player_name: string;
  acs: number;
  kd_ratio: number;
  kast_pct: number;
  top_agents: string[];          // Top 3 most played agents
}

// =============================================================================
// Filter Types
// =============================================================================
export interface PlayerFilters {
  playerId: string;
  seriesIds: string[];
}

export interface AnalyticsFilters {
  teamId: string;
  seriesIds: string[];
  mapName?: string;
}

// =============================================================================
// COMPOSITION ANALYTICS TYPES (COMP-01 to COMP-06)
// =============================================================================

// Team composition with usage stats (COMP-01, COMP-02)
export interface CompositionStats {
  composition: string[]; // Sorted array of agent names
  games_played: number;
  win_count: number;
  win_rate: number;
  maps_played: string[];
}

// Composition performance by map (COMP-03)
export interface CompositionMapStats {
  composition: string[];
  map_name: string;
  games: number;
  wins: number;
  win_rate: number;
}

// Meta adaptation point (COMP-04)
export interface MetaAdaptationPoint {
  series_date: string;
  series_id: string;
  composition: string[];
  is_new_comp: boolean;
  consecutive_uses: number;
}

// Role distribution (COMP-06)
export interface RoleDistribution {
  game_id: string;
  map_name: string;
  duelist_count: number;
  controller_count: number;
  initiator_count: number;
  sentinel_count: number;
}

// Agent role classification
export type AgentRole = 'duelist' | 'controller' | 'initiator' | 'sentinel';

// Composition filters
export interface CompositionFilters {
  teamId: string;
  seriesIds: string[];
  mapName?: string;
}

// =============================================================================
// MAP ANALYTICS TYPES (MAP-01 to MAP-04)
// =============================================================================

// Per-map performance (MAP-01)
export interface MapWinRate {
  map_name: string;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_rounds_won: number;
  avg_rounds_lost: number;
}

// Map composition preference (MAP-02)
export interface MapCompositionPreference {
  composition: string[];
  times_used: number;
  win_rate: number;
}

// Map site attack pattern (MAP-03)
export interface MapSitePattern {
  site: string;
  attack_count: number;
  attack_pct: number;
  success_rate: number;
}

// Map pool analysis (MAP-04)
export interface MapPoolAnalysis {
  strengths: Array<{ map: string; win_rate: number }>;
  weaknesses: Array<{ map: string; win_rate: number }>;
  neutral: Array<{ map: string; win_rate: number }>;
}

// Map-specific filters
export interface MapFilters {
  teamId: string;
  seriesIds: string[];
  mapName: string;
}

// =============================================================================
// TEAM STRATEGY ANALYTICS TYPES (STRAT-01 to STRAT-07)
// =============================================================================

// Pistol round patterns (STRAT-01, STRAT-02)
export interface PistolPattern {
  strategy_type: string; // 'fast_execute' | 'default' | 'no_plant'
  round_count: number;
  success_rate: number;
  avg_plant_time_ms: number | null;
}

// Economy management patterns (STRAT-03, STRAT-04)
export interface EconomyPattern {
  economy_type: string; // 'pistol' | 'eco' | 'half_buy' | 'force_buy' | 'full_buy'
  round_count: number;
  win_rate: number;
  avg_loadout: number;
}

// Site attack preferences (STRAT-05, STRAT-06)
export interface SitePreference {
  map_name: string;
  site: string; // 'A' | 'B' | 'C'
  plant_count: number;
  plant_pct: number;
  success_rate: number;
}

// Combined team strategies summary (STRAT-07)
export interface TeamStrategiesSummary {
  pistol_patterns: PistolPattern[];
  economy_patterns: EconomyPattern[];
  site_preferences: Record<string, SitePreference[]>; // Grouped by map_name
}
