import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFunctions() {
  console.log('Checking which functions exist...\n')

  // Get a team and series for testing
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .limit(3)

  const { data: series } = await supabase
    .from('series')
    .select('id')
    .limit(3)

  if (!teams || !series || teams.length === 0 || series.length === 0) {
    console.log('No data found to test with')
    return
  }

  console.log('Test data:')
  console.log('Teams:', teams.map(t => `${t.id} (${t.name})`).join(', '))
  console.log('Series IDs:', series.map(s => s.id).join(', '))
  console.log()

  const teamId = teams[0].id
  const seriesIds = series.map(s => s.id)

  // List of functions to test
  const functions = [
    'get_team_players_summary',
    'get_team_strategies_summary',
    'get_team_attack_pistol_patterns',
    'get_team_economy_patterns',
    'get_team_site_preferences',
    'get_player_core_stats',
    'get_player_agent_pool',
    'get_player_first_blood_stats',
    'get_player_clutch_stats',
    'get_player_performance_trend',
    'refresh_analytics_views',
  ]

  console.log('Testing RPC functions:\n')

  for (const funcName of functions) {
    try {
      let result

      if (funcName === 'refresh_analytics_views') {
        result = await supabase.rpc(funcName)
      } else if (funcName.startsWith('get_team')) {
        result = await supabase.rpc(funcName, {
          p_team_id: teamId,
          p_series_ids: seriesIds
        })
      } else if (funcName.startsWith('get_player')) {
        // Get a player ID first
        const { data: players } = await supabase
          .from('players')
          .select('id')
          .limit(1)

        if (!players || players.length === 0) continue

        result = await supabase.rpc(funcName, {
          p_player_id: players[0].id,
          p_series_ids: seriesIds
        })
      }

      if (result) {
        if (result.error) {
          console.log(`✗ ${funcName}: ${result.error.message}`)
        } else {
          console.log(`✓ ${funcName}: Works! (returned ${JSON.stringify(result.data)?.length || 0} chars)`)
        }
      } else {
        console.log(`⊘ ${funcName}: Skipped (no test data available)`)
      }
    } catch (err: any) {
      console.log(`✗ ${funcName}: ${err.message}`)
    }
  }

  // Check materialized views
  console.log('\n\nChecking materialized views:\n')

  const views = [
    'mv_player_core_stats',
    'mv_player_agent_pool',
    'mv_team_map_stats',
    'mv_team_compositions'
  ]

  for (const view of views) {
    try {
      const { count, error } = await supabase
        .from(view)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`✗ ${view}: ${error.message}`)
      } else {
        console.log(`✓ ${view}: ${count} rows`)
      }
    } catch (err: any) {
      console.log(`✗ ${view}: ${err.message}`)
    }
  }
}

checkFunctions().catch(console.error)
