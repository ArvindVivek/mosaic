-- Team Strategy Analytics Database Functions
-- Migration 002: Aggregation functions for attack patterns, economy analysis, and site preferences
-- Created: 2026-01-29

-- ============================================================================
-- Function 1: Attack-side pistol round patterns
-- ============================================================================
-- Analyzes pistol rounds (rounds 0 and 12) to classify attack strategies
-- based on spike plant timing and calculate success rates.
--
-- Strategy classification:
-- - 'fast_execute': spike planted within 60 seconds
-- - 'default': spike planted after 60 seconds
-- - 'no_plant': no spike plant occurred
--
-- Side logic: rounds 0-11 = team_a attacks, rounds 12+ = team_b attacks

CREATE OR REPLACE FUNCTION get_team_attack_pistol_patterns(
  p_team_id TEXT,
  p_series_ids TEXT[]
)
RETURNS TABLE(
  strategy_type TEXT,
  round_count BIGINT,
  success_rate NUMERIC,
  avg_plant_time_ms NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH pistol_rounds AS (
    -- Identify pistol rounds where team was attacking
    SELECT
      r.id AS round_id,
      r.winning_team_id,
      -- Determine attacking team based on round number
      CASE
        WHEN r.round_number < 12 THEN s.team_a_id
        ELSE s.team_b_id
      END AS attacking_team_id
    FROM rounds r
    JOIN games g ON r.game_id = g.id
    JOIN series s ON g.series_id = s.id
    WHERE
      g.series_id = ANY(p_series_ids)
      AND r.round_number IN (0, 12) -- Pistol rounds only
      AND (
        -- Filter to rounds where p_team_id was attacking
        (r.round_number < 12 AND s.team_a_id = p_team_id) OR
        (r.round_number >= 12 AND s.team_b_id = p_team_id)
      )
  ),
  spike_plants AS (
    -- Get spike plant timing for classification
    SELECT
      se.round_id,
      se.game_time_ms AS plant_time_ms
    FROM spike_events se
    WHERE se.event_type = 'plant'
  )
  SELECT
    -- Classify strategy based on plant timing
    CASE
      WHEN sp.plant_time_ms < 60000 THEN 'fast_execute'
      WHEN sp.plant_time_ms IS NULL THEN 'no_plant'
      ELSE 'default'
    END AS strategy_type,
    COUNT(*)::BIGINT AS round_count,
    -- Success rate: percentage of rounds won when using this strategy
    ROUND(
      COUNT(*) FILTER (WHERE pr.winning_team_id = pr.attacking_team_id)::NUMERIC /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) AS success_rate,
    -- Average plant time for this strategy (NULL for no_plant)
    ROUND(AVG(sp.plant_time_ms), 2) AS avg_plant_time_ms
  FROM pistol_rounds pr
  LEFT JOIN spike_plants sp ON pr.round_id = sp.round_id
  GROUP BY strategy_type
  ORDER BY round_count DESC;
END;
$$;

-- ============================================================================
-- Function 2: Economy pattern analysis
-- ============================================================================
-- Analyzes team performance across different economy states to identify
-- win rates and spending patterns for each buy type.
--
-- Economy thresholds (from STATE.md):
-- - eco: <5000
-- - half_buy: 5000-14999
-- - force_buy: 15000-19999
-- - full_buy: >=20000
-- - pistol: rounds 0 and 12 (special case)

CREATE OR REPLACE FUNCTION get_team_economy_patterns(
  p_team_id TEXT,
  p_series_ids TEXT[]
)
RETURNS TABLE(
  economy_type TEXT,
  round_count BIGINT,
  win_rate NUMERIC,
  avg_loadout NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH team_rounds AS (
    SELECT
      r.id AS round_id,
      r.round_number,
      r.winning_team_id,
      -- Determine team's loadout value based on side
      CASE
        WHEN r.round_number < 12 AND s.team_a_id = p_team_id THEN r.team_a_loadout_value
        WHEN r.round_number >= 12 AND s.team_b_id = p_team_id THEN r.team_b_loadout_value
        ELSE NULL
      END AS team_loadout_value,
      -- Track if team won
      CASE
        WHEN r.round_number < 12 AND s.team_a_id = p_team_id THEN r.winning_team_id = s.team_a_id
        WHEN r.round_number >= 12 AND s.team_b_id = p_team_id THEN r.winning_team_id = s.team_b_id
        ELSE FALSE
      END AS team_won
    FROM rounds r
    JOIN games g ON r.game_id = g.id
    JOIN series s ON g.series_id = s.id
    WHERE
      g.series_id = ANY(p_series_ids)
      AND (
        (r.round_number < 12 AND s.team_a_id = p_team_id) OR
        (r.round_number >= 12 AND s.team_b_id = p_team_id) OR
        (r.round_number < 12 AND s.team_b_id = p_team_id) OR
        (r.round_number >= 12 AND s.team_a_id = p_team_id)
      )
  )
  SELECT
    -- Classify economy type
    CASE
      WHEN round_number IN (0, 12) THEN 'pistol'
      WHEN team_loadout_value < 5000 THEN 'eco'
      WHEN team_loadout_value < 15000 THEN 'half_buy'
      WHEN team_loadout_value < 20000 THEN 'force_buy'
      ELSE 'full_buy'
    END AS economy_type,
    COUNT(*)::BIGINT AS round_count,
    -- Win rate for this economy type
    ROUND(
      COUNT(*) FILTER (WHERE team_won)::NUMERIC /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) AS win_rate,
    -- Average loadout value for this economy type
    ROUND(AVG(team_loadout_value), 2) AS avg_loadout
  FROM team_rounds
  WHERE team_loadout_value IS NOT NULL OR round_number IN (0, 12)
  GROUP BY economy_type
  ORDER BY
    -- Logical ordering: pistol, eco, half_buy, force_buy, full_buy
    CASE economy_type
      WHEN 'pistol' THEN 1
      WHEN 'eco' THEN 2
      WHEN 'half_buy' THEN 3
      WHEN 'force_buy' THEN 4
      WHEN 'full_buy' THEN 5
    END;
END;
$$;

-- ============================================================================
-- Function 3: Site attack preferences
-- ============================================================================
-- Analyzes spike plant locations to determine team's site preferences by map.
-- Calculates plant distribution and success rates per site.
--
-- Parameters:
-- - p_map_name: Optional filter for specific map (NULL = all maps)

CREATE OR REPLACE FUNCTION get_team_site_preferences(
  p_team_id TEXT,
  p_series_ids TEXT[],
  p_map_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  map_name TEXT,
  site TEXT,
  plant_count BIGINT,
  plant_pct NUMERIC,
  success_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH attacking_rounds AS (
    -- Get rounds where team was attacking
    SELECT
      r.id AS round_id,
      r.winning_team_id,
      g.map_name,
      -- Determine attacking team
      CASE
        WHEN r.round_number < 12 THEN s.team_a_id
        ELSE s.team_b_id
      END AS attacking_team_id
    FROM rounds r
    JOIN games g ON r.game_id = g.id
    JOIN series s ON g.series_id = s.id
    WHERE
      g.series_id = ANY(p_series_ids)
      AND (
        (r.round_number < 12 AND s.team_a_id = p_team_id) OR
        (r.round_number >= 12 AND s.team_b_id = p_team_id)
      )
      AND (p_map_name IS NULL OR g.map_name = p_map_name)
  ),
  spike_plants AS (
    -- Get spike plant events with site information
    SELECT
      se.round_id,
      se.site,
      ar.map_name,
      ar.winning_team_id,
      ar.attacking_team_id
    FROM spike_events se
    JOIN attacking_rounds ar ON se.round_id = ar.round_id
    WHERE se.event_type = 'plant'
  ),
  map_totals AS (
    -- Calculate total plants per map for percentage calculation
    SELECT
      map_name,
      COUNT(*)::BIGINT AS total_plants
    FROM spike_plants
    GROUP BY map_name
  )
  SELECT
    sp.map_name,
    sp.site,
    COUNT(*)::BIGINT AS plant_count,
    -- Percentage of plants on this map that went to this site
    ROUND(
      COUNT(*)::NUMERIC / NULLIF(mt.total_plants, 0) * 100,
      2
    ) AS plant_pct,
    -- Success rate when planting at this site
    ROUND(
      COUNT(*) FILTER (WHERE sp.winning_team_id = sp.attacking_team_id)::NUMERIC /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) AS success_rate
  FROM spike_plants sp
  JOIN map_totals mt ON sp.map_name = mt.map_name
  GROUP BY sp.map_name, sp.site, mt.total_plants
  ORDER BY sp.map_name, plant_count DESC;
END;
$$;

-- ============================================================================
-- Function 4: Combined team strategies summary
-- ============================================================================
-- Aggregates results from all strategy functions into a single JSONB response
-- for efficient single-call retrieval of all team strategy analytics.

CREATE OR REPLACE FUNCTION get_team_strategies_summary(
  p_team_id TEXT,
  p_series_ids TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Build comprehensive strategy summary
  SELECT jsonb_build_object(
    'pistol_patterns', (
      SELECT COALESCE(jsonb_agg(row_to_json(pistol_data)), '[]'::jsonb)
      FROM (
        SELECT * FROM get_team_attack_pistol_patterns(p_team_id, p_series_ids)
      ) pistol_data
    ),
    'economy_patterns', (
      SELECT COALESCE(jsonb_agg(row_to_json(econ_data)), '[]'::jsonb)
      FROM (
        SELECT * FROM get_team_economy_patterns(p_team_id, p_series_ids)
      ) econ_data
    ),
    'site_preferences', (
      SELECT COALESCE(
        jsonb_object_agg(
          map_name,
          jsonb_agg(
            jsonb_build_object(
              'site', site,
              'plant_count', plant_count,
              'plant_pct', plant_pct,
              'success_rate', success_rate
            )
          )
        ),
        '{}'::jsonb
      )
      FROM (
        SELECT
          map_name,
          site,
          plant_count,
          plant_pct,
          success_rate
        FROM get_team_site_preferences(p_team_id, p_series_ids, NULL)
      ) site_data
      GROUP BY map_name
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- Migration complete
-- ============================================================================
-- Created 4 database functions:
-- 1. get_team_attack_pistol_patterns - Pistol round strategy classification
-- 2. get_team_economy_patterns - Economy-based win rate analysis
-- 3. get_team_site_preferences - Site attack preference by map
-- 4. get_team_strategies_summary - Combined JSONB summary
