-- Complete fix for Mosaic database functions and materialized views
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/fbloukfgdjvwzdgrcnzt/sql/new

-- ============================================================================
-- FIX 1: Create missing get_team_site_preferences function
-- ============================================================================

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
    SELECT
      r.id AS round_id,
      r.winning_team_id,
      g.map_name,
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
    ROUND(
      COUNT(*)::NUMERIC / NULLIF(mt.total_plants, 0) * 100,
      2
    ) AS plant_pct,
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
-- FIX 2: get_team_strategies_summary function
-- Issue: References non-existent column names from economy_patterns
-- ============================================================================

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
          sites
        ),
        '{}'::jsonb
      )
      FROM (
        SELECT
          map_name,
          jsonb_agg(
            jsonb_build_object(
              'site', site,
              'plant_count', plant_count,
              'plant_pct', plant_pct,
              'success_rate', success_rate
            )
          ) as sites
        FROM get_team_site_preferences(p_team_id, p_series_ids, NULL)
        GROUP BY map_name
      ) site_data
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- FIX 2: Refresh all materialized views to populate data
-- ============================================================================

REFRESH MATERIALIZED VIEW mv_player_core_stats;
REFRESH MATERIALIZED VIEW mv_player_agent_pool;
REFRESH MATERIALIZED VIEW mv_team_map_stats;
REFRESH MATERIALIZED VIEW mv_team_compositions;

-- ============================================================================
-- VERIFICATION: Check that data now exists
-- ============================================================================

SELECT 'mv_player_core_stats' as view_name, COUNT(*) as row_count FROM mv_player_core_stats
UNION ALL
SELECT 'mv_player_agent_pool', COUNT(*) FROM mv_player_agent_pool
UNION ALL
SELECT 'mv_team_map_stats', COUNT(*) FROM mv_team_map_stats
UNION ALL
SELECT 'mv_team_compositions', COUNT(*) FROM mv_team_compositions;

-- ============================================================================
-- TEST: Verify functions work
-- ============================================================================

-- Test get_team_players_summary with first available team and series
DO $$
DECLARE
  test_team_id TEXT;
  test_series_id TEXT;
  result JSONB;
BEGIN
  SELECT id INTO test_team_id FROM teams LIMIT 1;
  SELECT id INTO test_series_id FROM series LIMIT 1;

  RAISE NOTICE 'Testing with team_id=%, series_id=%', test_team_id, test_series_id;

  SELECT get_team_players_summary(test_team_id, ARRAY[test_series_id]::TEXT[]) INTO result;
  RAISE NOTICE 'get_team_players_summary result: %', result;

  SELECT get_team_strategies_summary(test_team_id, ARRAY[test_series_id]::TEXT[]) INTO result;
  RAISE NOTICE 'get_team_strategies_summary result: %', result;
END $$;
