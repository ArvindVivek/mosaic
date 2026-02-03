-- Fix for get_team_strategies_summary function
-- The economy_patterns returns differently named columns

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
