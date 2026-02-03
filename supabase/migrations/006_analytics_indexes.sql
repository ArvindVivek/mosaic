-- Migration: Performance indexes on materialized views
-- Purpose: Enable CONCURRENTLY refresh and optimize query performance
-- Pattern: UNIQUE indexes required for REFRESH MATERIALIZED VIEW CONCURRENTLY

-- Indexes for mv_player_core_stats
-- UNIQUE index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_player_core_stats_unique
  ON mv_player_core_stats(player_id, series_id);
CREATE INDEX idx_mv_player_core_stats_player
  ON mv_player_core_stats(player_id);
CREATE INDEX idx_mv_player_core_stats_team
  ON mv_player_core_stats(team_id);
CREATE INDEX idx_mv_player_core_stats_series
  ON mv_player_core_stats(series_id);
CREATE INDEX idx_mv_player_core_stats_acs
  ON mv_player_core_stats(acs DESC);

-- Indexes for mv_player_agent_pool
CREATE UNIQUE INDEX idx_mv_player_agent_pool_unique
  ON mv_player_agent_pool(player_id, agent, series_id);
CREATE INDEX idx_mv_player_agent_pool_player
  ON mv_player_agent_pool(player_id);
CREATE INDEX idx_mv_player_agent_pool_agent
  ON mv_player_agent_pool(agent);
CREATE INDEX idx_mv_player_agent_pool_series
  ON mv_player_agent_pool(series_id);

-- Indexes for mv_team_map_stats
CREATE UNIQUE INDEX idx_mv_team_map_stats_unique
  ON mv_team_map_stats(team_id, map_name, series_id);
CREATE INDEX idx_mv_team_map_stats_team
  ON mv_team_map_stats(team_id);
CREATE INDEX idx_mv_team_map_stats_map
  ON mv_team_map_stats(map_name);
CREATE INDEX idx_mv_team_map_stats_series
  ON mv_team_map_stats(series_id);
CREATE INDEX idx_mv_team_map_stats_win_rate
  ON mv_team_map_stats(win_rate DESC);

-- Indexes for mv_team_compositions
CREATE UNIQUE INDEX idx_mv_team_compositions_unique
  ON mv_team_compositions(team_id, series_id, composition);
CREATE INDEX idx_mv_team_compositions_team
  ON mv_team_compositions(team_id);
CREATE INDEX idx_mv_team_compositions_series
  ON mv_team_compositions(series_id);

-- Composite indexes for common query patterns
-- Team + series filter (most common)
CREATE INDEX idx_mv_player_core_stats_team_series
  ON mv_player_core_stats(team_id, series_id);
CREATE INDEX idx_mv_player_agent_pool_player_series
  ON mv_player_agent_pool(player_id, series_id);
