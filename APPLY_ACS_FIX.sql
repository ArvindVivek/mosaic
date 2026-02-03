-- ============================================================================= 
-- MOSAIC ACS FORMULA FIX - Apply this in Supabase SQL Editor
-- Paste this entire file into: https://supabase.com/dashboard/project/fbloukfgdjvwzdgrcnzt/sql/new
-- =============================================================================

-- Step 1: Create the round ACS materialized view with proper formula
DROP MATERIALIZED VIEW IF EXISTS mv_round_acs CASCADE;

CREATE MATERIALIZED VIEW mv_round_acs AS
WITH round_player_teams AS (
  SELECT DISTINCT prs.round_id, prs.player_id, prs.team_id
  FROM player_round_stats prs
),
round_kills_ordered AS (
  SELECT
    ke.id AS kill_id, ke.round_id, ke.killer_id, ke.game_time_ms, rpt.team_id AS killer_team_id,
    ROW_NUMBER() OVER (PARTITION BY ke.round_id, rpt.team_id ORDER BY ke.game_time_ms) AS team_kill_order
  FROM kill_events ke
  JOIN round_player_teams rpt ON ke.round_id = rpt.round_id AND ke.killer_id = rpt.player_id
  WHERE ke.killer_id IS NOT NULL
),
kill_points AS (
  SELECT
    rko.round_id, rko.killer_id,
    CASE GREATEST(1, 5 - (rko.team_kill_order - 1)::INTEGER)
      WHEN 5 THEN 150 WHEN 4 THEN 130 WHEN 3 THEN 110 WHEN 2 THEN 90 ELSE 70
    END AS kill_pts,
    CASE WHEN (rko.game_time_ms - LAG(rko.game_time_ms) OVER (PARTITION BY rko.round_id, rko.killer_id ORDER BY rko.game_time_ms)) <= 3000 THEN 50 ELSE 0 END AS multikill_bonus
  FROM round_kills_ordered rko
),
player_kill_points AS (
  SELECT round_id, killer_id AS player_id, SUM(kill_pts) AS total_kill_points, SUM(multikill_bonus) AS total_multikill_bonus
  FROM kill_points GROUP BY round_id, killer_id
),
player_assists AS (
  SELECT round_id, assister_id AS player_id, COUNT(*) * 25 AS assist_points
  FROM kill_assists GROUP BY round_id, assister_id
)
SELECT
  prs.round_id, prs.player_id, prs.team_id, g.series_id,
  COALESCE(prs.damage_dealt, 0) AS damage,
  COALESCE(pkp.total_kill_points, 0) AS kill_points,
  COALESCE(pkp.total_multikill_bonus, 0) AS multikill_bonus,
  COALESCE(pa.assist_points, 0) AS assist_points,
  (COALESCE(prs.damage_dealt, 0) + COALESCE(pkp.total_kill_points, 0) + COALESCE(pkp.total_multikill_bonus, 0) + COALESCE(pa.assist_points, 0))::INTEGER AS round_acs
FROM player_round_stats prs
JOIN rounds r ON prs.round_id = r.id
JOIN games g ON r.game_id = g.id
LEFT JOIN player_kill_points pkp ON prs.round_id = pkp.round_id AND prs.player_id = pkp.player_id
LEFT JOIN player_assists pa ON prs.round_id = pa.round_id AND prs.player_id = pa.player_id;

CREATE INDEX idx_mv_round_acs_player ON mv_round_acs (player_id, series_id);
CREATE INDEX idx_mv_round_acs_team ON mv_round_acs (team_id, series_id);
CREATE INDEX idx_mv_round_acs_round ON mv_round_acs (round_id);

-- Step 2: Update get_player_core_stats function
CREATE OR REPLACE FUNCTION get_player_core_stats(p_player_id TEXT, p_series_ids TEXT[])
RETURNS TABLE(player_id TEXT, player_name TEXT, rounds_played BIGINT, acs NUMERIC(7,2), kd_ratio NUMERIC(5,2), adr NUMERIC(7,2), headshot_pct NUMERIC(5,2), kast_pct NUMERIC(5,2))
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH player_acs AS (
    SELECT ra.player_id, COUNT(*) AS rounds_played, SUM(ra.round_acs) AS total_combat_score, SUM(ra.damage) AS total_damage
    FROM mv_round_acs ra WHERE ra.player_id = p_player_id AND ra.series_id = ANY(p_series_ids) GROUP BY ra.player_id
  ),
  player_kda AS (
    SELECT prs.player_id, SUM(prs.kills) AS total_kills, SUM(prs.deaths) AS total_deaths,
      COUNT(*) FILTER (WHERE prs.kills > 0 OR prs.assists > 0 OR prs.deaths = 0 OR prs.traded = true) AS kast_rounds, COUNT(*) AS total_rounds
    FROM player_round_stats prs JOIN rounds r ON prs.round_id = r.id JOIN games g ON r.game_id = g.id
    WHERE prs.player_id = p_player_id AND g.series_id = ANY(p_series_ids) GROUP BY prs.player_id
  ),
  headshot_stats AS (
    SELECT ke.killer_id AS player_id, COUNT(*) FILTER (WHERE ke.headshot = true) AS headshot_kills, COUNT(*) AS total_kills_from_events
    FROM kill_events ke JOIN rounds r ON ke.round_id = r.id JOIN games g ON r.game_id = g.id
    WHERE ke.killer_id = p_player_id AND g.series_id = ANY(p_series_ids) GROUP BY ke.killer_id
  )
  SELECT pa.player_id, p.name AS player_name, pa.rounds_played,
    ROUND(pa.total_combat_score::NUMERIC / NULLIF(pa.rounds_played, 0), 2) AS acs,
    ROUND(pk.total_kills::NUMERIC / NULLIF(pk.total_deaths, 0), 2) AS kd_ratio,
    ROUND(pa.total_damage::NUMERIC / NULLIF(pa.rounds_played, 0), 2) AS adr,
    ROUND(COALESCE(hs.headshot_kills, 0)::NUMERIC / NULLIF(hs.total_kills_from_events, 0) * 100, 2) AS headshot_pct,
    ROUND(pk.kast_rounds::NUMERIC / NULLIF(pk.total_rounds, 0) * 100, 2) AS kast_pct
  FROM player_acs pa JOIN players p ON pa.player_id = p.id
  LEFT JOIN player_kda pk ON pa.player_id = pk.player_id
  LEFT JOIN headshot_stats hs ON pa.player_id = hs.player_id;
END; $$;

-- Step 3: Update get_player_agent_pool function  
CREATE OR REPLACE FUNCTION get_player_agent_pool(p_player_id TEXT, p_series_ids TEXT[])
RETURNS TABLE(agent TEXT, games_played BIGINT, rounds_played BIGINT, pick_rate NUMERIC(5,2), win_rate NUMERIC(5,2), avg_acs NUMERIC(7,2))
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH player_total_games AS (
    SELECT COUNT(DISTINCT g.id) AS total_games FROM player_round_stats prs JOIN rounds r ON prs.round_id = r.id JOIN games g ON r.game_id = g.id
    WHERE prs.player_id = p_player_id AND g.series_id = ANY(p_series_ids)
  ),
  agent_stats AS (
    SELECT prs.agent, COUNT(DISTINCT g.id) AS games_played, COUNT(DISTINCT prs.round_id) AS rounds_played,
      COUNT(DISTINCT r.id) FILTER (WHERE r.winning_team_id = prs.team_id) AS rounds_won, COUNT(DISTINCT r.id) AS total_rounds
    FROM player_round_stats prs JOIN rounds r ON prs.round_id = r.id JOIN games g ON r.game_id = g.id
    WHERE prs.player_id = p_player_id AND g.series_id = ANY(p_series_ids) GROUP BY prs.agent
  ),
  agent_acs AS (
    SELECT prs.agent, SUM(ra.round_acs) AS total_combat_score, COUNT(*) AS round_count
    FROM player_round_stats prs JOIN mv_round_acs ra ON prs.round_id = ra.round_id AND prs.player_id = ra.player_id
    JOIN rounds r ON prs.round_id = r.id JOIN games g ON r.game_id = g.id
    WHERE prs.player_id = p_player_id AND g.series_id = ANY(p_series_ids) GROUP BY prs.agent
  )
  SELECT a.agent, a.games_played::BIGINT, a.rounds_played::BIGINT,
    ROUND(a.games_played::NUMERIC / NULLIF((SELECT total_games FROM player_total_games), 0) * 100, 2) AS pick_rate,
    ROUND(a.rounds_won::NUMERIC / NULLIF(a.total_rounds, 0) * 100, 2) AS win_rate,
    ROUND(aa.total_combat_score::NUMERIC / NULLIF(aa.round_count, 0), 2) AS avg_acs
  FROM agent_stats a LEFT JOIN agent_acs aa ON a.agent = aa.agent ORDER BY a.games_played DESC;
END; $$;

-- Step 4: Recreate mv_player_core_stats
DROP MATERIALIZED VIEW IF EXISTS mv_player_core_stats CASCADE;
CREATE MATERIALIZED VIEW mv_player_core_stats AS
WITH player_acs AS (
  SELECT ra.player_id, ra.team_id, ra.series_id, COUNT(*) AS rounds_played, SUM(ra.round_acs) AS total_combat_score, SUM(ra.damage) AS total_damage
  FROM mv_round_acs ra GROUP BY ra.player_id, ra.team_id, ra.series_id
),
player_kda AS (
  SELECT prs.player_id, g.series_id, SUM(prs.kills) AS total_kills, SUM(prs.deaths) AS total_deaths, SUM(prs.assists) AS total_assists,
    COUNT(*) FILTER (WHERE prs.kills > 0 OR prs.assists > 0 OR prs.deaths = 0 OR prs.traded = true) AS kast_rounds, COUNT(*) AS total_rounds
  FROM player_round_stats prs JOIN rounds r ON prs.round_id = r.id JOIN games g ON r.game_id = g.id GROUP BY prs.player_id, g.series_id
),
headshots AS (
  SELECT ke.killer_id AS player_id, g.series_id, COUNT(*) FILTER (WHERE ke.headshot = true) AS headshot_kills, COUNT(*) AS total_kills_with_data
  FROM kill_events ke JOIN rounds r ON ke.round_id = r.id JOIN games g ON r.game_id = g.id WHERE ke.killer_id IS NOT NULL GROUP BY ke.killer_id, g.series_id
)
SELECT pa.player_id, p.name AS player_name, pa.team_id, pa.series_id, pa.rounds_played,
  ROUND(pa.total_combat_score::NUMERIC / NULLIF(pa.rounds_played, 0), 2) AS acs,
  ROUND(pk.total_kills::NUMERIC / NULLIF(pk.total_deaths, 0), 2) AS kd_ratio,
  ROUND(pa.total_damage::NUMERIC / NULLIF(pa.rounds_played, 0), 2) AS adr,
  ROUND(COALESCE(hs.headshot_kills, 0)::NUMERIC / NULLIF(COALESCE(hs.total_kills_with_data, 0), 0) * 100, 2) AS headshot_pct,
  ROUND(pk.kast_rounds::NUMERIC / NULLIF(pk.total_rounds, 0) * 100, 2) AS kast_pct,
  pk.total_kills, pk.total_deaths, pk.total_assists
FROM player_acs pa JOIN players p ON pa.player_id = p.id
LEFT JOIN player_kda pk ON pa.player_id = pk.player_id AND pa.series_id = pk.series_id
LEFT JOIN headshots hs ON pa.player_id = hs.player_id AND pa.series_id = hs.series_id;

CREATE UNIQUE INDEX IF NOT EXISTS mv_player_core_stats_idx ON mv_player_core_stats (player_id, series_id);

-- Step 5: Success message
SELECT 'ACS formula fix applied successfully! Mosaic now uses the correct VALORANT combat score formula.' AS status;
