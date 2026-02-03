-- Check for 2Game (Detonation Gaming / 2Game) team data
SELECT 
  t.id, 
  t.name,
  COUNT(DISTINCT s.id) as series_count,
  COUNT(DISTINCT p.id) as player_count
FROM teams t
LEFT JOIN series s ON (s.team_a_id = t.id OR s.team_b_id = t.id)
LEFT JOIN players p ON p.team_id = t.id
WHERE LOWER(t.name) LIKE '%2game%' OR LOWER(t.name) LIKE '%detonation%'
GROUP BY t.id, t.name;
