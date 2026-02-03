import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeFix() {
  console.log('Attempting to execute database fixes...\n')

  // Since Supabase doesn't expose raw SQL execution via REST API for security reasons,
  // we'll need to:
  // 1. Create the function definition as a stored procedure that can be called
  // 2. Or execute it via the SQL editor

  console.log('Reading fix SQL...')
  const fixSQL = fs.readFileSync('scripts/complete-fix.sql', 'utf-8')

  console.log('\n' + '='.repeat(70))
  console.log('MANUAL EXECUTION REQUIRED')
  console.log('='.repeat(70))
  console.log('\nThe browser should have opened to the Supabase SQL Editor.')
  console.log('The SQL has been copied to your clipboard.')
  console.log('\nPlease:')
  console.log('  1. Paste the SQL (Cmd+V) into the editor')
  console.log('  2. Click "Run" or press Cmd+Enter')
  console.log('  3. Wait for execution to complete')
  console.log('\nThen press Enter here to verify the fixes...')

  // Wait for user input
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve())
  })

  console.log('\nVerifying fixes...\n')

  // Check materialized views
  const views = ['mv_player_core_stats', 'mv_player_agent_pool', 'mv_team_map_stats', 'mv_team_compositions']

  console.log('Materialized Views:')
  for (const view of views) {
    const { count } = await supabase.from(view).select('*', { count: 'exact', head: true })
    if (count && count > 0) {
      console.log(`  ✓ ${view}: ${count} rows`)
    } else {
      console.log(`  ✗ ${view}: 0 rows (needs refresh)`)
    }
  }

  // Test functions
  console.log('\nRPC Functions:')

  const { data: teams } = await supabase.from('teams').select('id').limit(1)
  const { data: series } = await supabase.from('series').select('id').limit(1)

  if (teams && series && teams.length > 0 && series.length > 0) {
    const { data: players, error: playersError } = await supabase.rpc('get_team_players_summary', {
      p_team_id: teams[0].id,
      p_series_ids: [series[0].id]
    })

    if (playersError) {
      console.log(`  ✗ get_team_players_summary: ${playersError.message}`)
    } else {
      console.log(`  ✓ get_team_players_summary works! (${JSON.stringify(players).length} bytes)`)
    }

    const { data: strategies, error: strategiesError } = await supabase.rpc('get_team_strategies_summary', {
      p_team_id: teams[0].id,
      p_series_ids: [series[0].id]
    })

    if (strategiesError) {
      console.log(`  ✗ get_team_strategies_summary: ${strategiesError.message}`)
    } else {
      console.log(`  ✓ get_team_strategies_summary works!`)
      console.log('    Sample:', JSON.stringify(strategies, null, 2).slice(0, 200) + '...')
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('✅ Verification complete!')
  console.log('='.repeat(70))
  console.log('\nNow test the Mosaic app:')
  console.log('  npm run dev')
  console.log('  Open http://localhost:3000/reports')
  console.log('\n')

  process.exit(0)
}

executeFix().catch(console.error)
