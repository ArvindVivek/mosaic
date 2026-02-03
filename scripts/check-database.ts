import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('Checking database state...\n')

  // Check raw data tables
  console.log('=== Raw Data Tables ===')

  const { count: seriesCount, error: seriesError } = await supabase
    .from('series')
    .select('*', { count: 'exact', head: true })

  console.log('series:', seriesError ? seriesError : `${seriesCount} rows`)

  const { count: gamesCount, error: gamesError } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })

  console.log('games:', gamesError ? gamesError : `${gamesCount} rows`)

  const { count: roundsCount, error: roundsError } = await supabase
    .from('rounds')
    .select('*', { count: 'exact', head: true })

  console.log('rounds:', roundsError ? roundsError : `${roundsCount} rows`)

  const { count: playersCount, error: playersError } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })

  console.log('players:', playersError ? playersError : `${playersCount} rows`)

  const { count: teamsCount, error: teamsError } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })

  console.log('teams:', teamsError ? teamsError : `${teamsCount} rows`)

  // Check some actual series IDs
  const { data: seriesSample, error: seriesSampleError } = await supabase
    .from('series')
    .select('id, tournament_id, team_a_id, team_b_id')
    .limit(5)

  console.log('\n=== Sample Series ===')
  if (seriesSampleError) {
    console.error('Error:', seriesSampleError)
  } else if (seriesSample && seriesSample.length > 0) {
    console.log('Available series:')
    seriesSample.forEach(s => console.log(`  - ${s.id}`))

    // Test RPC functions with empty array
    console.log('\n=== RPC Functions with [] ===')
    const { data: mvPlayers, error: mvPlayersError } = await supabase
      .rpc('get_team_players_summary', { series_ids: [] })

    console.log('get_team_players_summary([]):', mvPlayersError ? mvPlayersError : `${mvPlayers?.length || 0} rows`)
    if (mvPlayers && mvPlayers.length > 0) {
      console.log('Sample:', mvPlayers.slice(0, 2))
    }

    const { data: mvStrategies, error: mvStrategiesError } = await supabase
      .rpc('get_team_strategies_summary', { series_ids: [] })

    console.log('get_team_strategies_summary([]):', mvStrategiesError ? mvStrategiesError : `${mvStrategies?.length || 0} rows`)
    if (mvStrategies && mvStrategies.length > 0) {
      console.log('Sample:', mvStrategies.slice(0, 2))
    }

    // Test with actual series ID
    console.log('\n=== RPC Functions with actual series ID ===')
    console.log('Testing with series ID:', seriesSample[0].id)
    const { data: testPlayers, error: testPlayersError } = await supabase
      .rpc('get_team_players_summary', { series_ids: [seriesSample[0].id] })

    console.log('Result:', testPlayersError ? testPlayersError : `${testPlayers?.length || 0} rows`)
    if (testPlayers && testPlayers.length > 0) {
      console.log('Sample:', testPlayers.slice(0, 2))
    }
  } else {
    console.log('No series found!')
  }
}

checkDatabase().catch(console.error)
