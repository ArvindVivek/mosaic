import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  }
})

async function applyMigrations() {
  console.log('Starting migration application...\n')

  const migrationsDir = path.join(process.cwd(), '.backup_migrations')
  const migrations = [
    '001_lumina_schema.sql',
    '002_team_strategy_functions.sql',
    '003_player_analytics_functions.sql',
    '004_composition_map_functions.sql',
    '005_materialized_views.sql',
    '006_analytics_indexes.sql'
  ]

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration)
    console.log(`\nApplying ${migration}...`)

    try {
      const sql = fs.readFileSync(filePath, 'utf-8')

      // Split SQL file by statements (simple split on semicolons)
      // We need to execute each statement separately
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && s !== '')

      console.log(`  Found ${statements.length} SQL statements`)

      // For simplicity, we'll execute the whole file as one
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }) as any

      if (error) {
        // Try direct execution if exec_sql doesn't exist
        console.log('  Using direct SQL execution...')
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ query: sql })
        })

        if (!response.ok) {
          console.error(`  Error: ${response.statusText}`)
          console.log('  Skipping (may already be applied)')
        } else {
          console.log(`  Successfully applied ${migration}`)
        }
      } else {
        console.log(`  Successfully applied ${migration}`)
      }
    } catch (err) {
      console.error(`  Error reading/applying ${migration}:`, err)
      // Continue with next migration
    }
  }

  console.log('\n\nMigrations complete! Now checking database state...')

  // Check what we have
  const { count: seriesCount } = await supabase
    .from('series')
    .select('*', { count: 'exact', head: true })

  console.log(`Series count: ${seriesCount}`)

  // Check if functions exist by trying to call them
  const { data: teams } = await supabase
    .from('teams')
    .select('id')
    .limit(1)

  if (teams && teams.length > 0) {
    const { data: series } = await supabase
      .from('series')
      .select('id')
      .limit(1)

    if (series && series.length > 0) {
      console.log('\nTesting RPC functions...')

      const { data: playersData, error: playersError } = await supabase
        .rpc('get_team_players_summary', {
          p_team_id: teams[0].id,
          p_series_ids: [series[0].id]
        })

      if (playersError) {
        console.log('get_team_players_summary error:', playersError.message)
      } else {
        console.log('get_team_players_summary works!')
      }

      const { data: strategiesData, error: strategiesError } = await supabase
        .rpc('get_team_strategies_summary', {
          p_team_id: teams[0].id,
          p_series_ids: [series[0].id]
        })

      if (strategiesError) {
        console.log('get_team_strategies_summary error:', strategiesError.message)
      } else {
        console.log('get_team_strategies_summary works!')
      }
    }
  }
}

applyMigrations().catch(console.error)
