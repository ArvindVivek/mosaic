// Quick script to check 2Game team data
import postgres from 'postgres';

const sql = postgres('postgresql://postgres:Eaglestrike%23123@db.fbloukfgdjvwzdgrcnzt.supabase.co:5432/postgres');

async function check() {
  try {
    // First, list all teams to see what's available
    console.log('=== ALL TEAMS ===');
    const teams = await sql`
      SELECT id, name
      FROM teams
      ORDER BY name
      LIMIT 20
    `;
    teams.forEach(t => console.log(`${t.id}: ${t.name}`));

    // Check for 2Game specifically
    console.log('\n=== 2GAME/DETONATION TEAMS ===');
    const twoGameTeams = await sql`
      SELECT
        t.id,
        t.name,
        COUNT(DISTINCT CASE WHEN s.team_a_id = t.id OR s.team_b_id = t.id THEN s.id END) as series_count,
        COUNT(DISTINCT p.id) as player_count
      FROM teams t
      LEFT JOIN series s ON (s.team_a_id = t.id OR s.team_b_id = t.id)
      LEFT JOIN players p ON p.team_id = t.id
      WHERE LOWER(t.name) LIKE '%2game%'
         OR LOWER(t.name) LIKE '%detonation%'
         OR LOWER(t.name) LIKE '%2g%'
         OR LOWER(t.name) LIKE '%dfm%'
      GROUP BY t.id, t.name
    `;
    console.log('Found teams:', twoGameTeams);

    // Check player round stats for these teams
    if (twoGameTeams.length > 0) {
      for (const team of twoGameTeams) {
        console.log(`\n=== STATS FOR ${team.name} ===`);
        const stats = await sql`
          SELECT
            p.id,
            p.name,
            COUNT(prs.id) as round_count,
            SUM(prs.damage_dealt) as total_damage
          FROM players p
          LEFT JOIN player_round_stats prs ON prs.player_id = p.id
          WHERE p.team_id = ${team.id}
          GROUP BY p.id, p.name
          LIMIT 10
        `;
        console.log('Players:', stats);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

check();
