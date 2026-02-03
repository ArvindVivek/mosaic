import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'

const DATABASE_URL = process.env.DATABASE_URL!

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1
})

async function runMigrations() {
  console.log('Connecting to database...\n')

  try {
    // Test connection
    const result = await sql`SELECT COUNT(*) as count FROM series`
    console.log(`Connected! Found ${result[0].count} series\n`)

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
      console.log(`\n${'='.repeat(60)}`)
      console.log(`Applying: ${migration}`)
      console.log('='.repeat(60))

      try {
        const sqlContent = fs.readFileSync(filePath, 'utf-8')

        // Execute the SQL file
        // postgres library can handle multi-statement SQL
        await sql.unsafe(sqlContent)

        console.log(`✓ Successfully applied ${migration}`)
      } catch (err: any) {
        // Check if error is about already existing objects
        if (
          err.message?.includes('already exists') ||
          err.message?.includes('duplicate')
        ) {
          console.log(`⚠ ${migration} - Objects already exist (skipping)`)
        } else {
          console.error(`✗ Error applying ${migration}:`, err.message)
          // Continue with other migrations
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('Migration application complete!')
    console.log('='.repeat(60))

    // Verify functions exist
    console.log('\nVerifying functions...')

    const { rows: functions } = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
        AND routine_name LIKE 'get_team_%'
      ORDER BY routine_name
    `

    console.log('\nAvailable team functions:')
    functions.forEach(f => console.log(`  - ${f.routine_name}`))

    // Try to refresh materialized views
    console.log('\nRefreshing materialized views...')
    try {
      await sql`REFRESH MATERIALIZED VIEW mv_player_core_stats`
      console.log('✓ Refreshed mv_player_core_stats')
    } catch (err: any) {
      console.error('✗ Error refreshing mv_player_core_stats:', err.message)
    }

    try {
      await sql`REFRESH MATERIALIZED VIEW mv_player_agent_pool`
      console.log('✓ Refreshed mv_player_agent_pool')
    } catch (err: any) {
      console.error('✗ Error refreshing mv_player_agent_pool:', err.message)
    }

    try {
      await sql`REFRESH MATERIALIZED VIEW mv_team_map_stats`
      console.log('✓ Refreshed mv_team_map_stats')
    } catch (err: any) {
      console.error('✗ Error refreshing mv_team_map_stats:', err.message)
    }

    try {
      await sql`REFRESH MATERIALIZED VIEW mv_team_compositions`
      console.log('✓ Refreshed mv_team_compositions')
    } catch (err: any) {
      console.error('✗ Error refreshing mv_team_compositions:', err.message)
    }

    // Test function calls
    console.log('\nTesting RPC functions...')

    const [team] = await sql`SELECT id FROM teams LIMIT 1`
    const [series] = await sql`SELECT id FROM series LIMIT 1`

    if (team && series) {
      console.log(`Testing with team_id=${team.id}, series_id=${series.id}`)

      try {
        const result = await sql`SELECT get_team_players_summary(${team.id}, ARRAY[${series.id}]::TEXT[])`
        console.log('✓ get_team_players_summary works!')
        console.log('  Sample:', JSON.stringify(result[0], null, 2).slice(0, 200) + '...')
      } catch (err: any) {
        console.error('✗ get_team_players_summary error:', err.message)
      }

      try {
        const result = await sql`SELECT get_team_strategies_summary(${team.id}, ARRAY[${series.id}]::TEXT[])`
        console.log('✓ get_team_strategies_summary works!')
        console.log('  Sample:', JSON.stringify(result[0], null, 2).slice(0, 200) + '...')
      } catch (err: any) {
        console.error('✗ get_team_strategies_summary error:', err.message)
      }
    }

    console.log('\n✅ All done!')
  } catch (err) {
    console.error('Fatal error:', err)
    throw err
  } finally {
    await sql.end()
  }
}

runMigrations().catch(err => {
  console.error(err)
  process.exit(1)
})
