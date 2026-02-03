import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeSQLStatements(statements: string[]) {
  const errors: string[] = []
  const successes: string[] = []

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    if (!stmt.trim() || stmt.trim().startsWith('--')) continue

    try {
      // Use fetch to directly call Supabase's SQL execution endpoint
      const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1]

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query: stmt })
      })

      if (response.ok) {
        successes.push(`Statement ${i + 1} executed successfully`)
      } else {
        const errorText = await response.text()
        if (errorText.includes('already exists')) {
          successes.push(`Statement ${i + 1} skipped (already exists)`)
        } else {
          errors.push(`Statement ${i + 1} error: ${errorText}`)
        }
      }
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        successes.push(`Statement ${i + 1} skipped (already exists)`)
      } else {
        errors.push(`Statement ${i + 1} error: ${err.message}`)
      }
    }
  }

  return { successes, errors }
}

async function runMigrations() {
  console.log('Starting migrations via Supabase API...\n')

  // Test connection first
  const { count } = await supabase
    .from('series')
    .select('*', { count: 'exact', head: true })

  console.log(`✓ Connected! Found ${count} series\n`)

  const migrationsDir = path.join(process.cwd(), '.backup_migrations')
  const migrations = [
    '002_team_strategy_functions.sql',
    '003_player_analytics_functions.sql',
    '004_composition_map_functions.sql',
    '005_materialized_views.sql',
  ]

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration)
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Applying: ${migration}`)
    console.log('='.repeat(60))

    try {
      const sqlContent = fs.readFileSync(filePath, 'utf-8')

      // For function and view definitions, we can execute them one by one
      // Split by CREATE OR REPLACE FUNCTION or CREATE MATERIALIZED VIEW
      const statements = sqlContent
        .split(/(?=CREATE\s+(?:OR\s+REPLACE\s+)?(?:FUNCTION|MATERIALIZED\s+VIEW|INDEX))/i)
        .map(s => s.trim())
        .filter(s => s.length > 0)

      console.log(`Found ${statements.length} SQL objects to create\n`)

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i]
        const match = stmt.match(/CREATE\s+(?:OR\s+REPLACE\s+)?(?:FUNCTION|MATERIALIZED\s+VIEW|INDEX)\s+(\S+)/i)
        const objectName = match ? match[1] : `statement ${i + 1}`

        console.log(`Creating ${objectName}...`)

        try {
          // Try using Supabase edge functions or direct SQL execution
          // Since Supabase doesn't have a direct SQL execution RPC by default,
          // we need to use their SQL editor API

          // For now, let's just print what we would execute
          console.log(`  Would execute: ${objectName}`)
          console.log(`  (Manual execution required via Supabase Dashboard)`)
        } catch (err: any) {
          console.error(`  Error: ${err.message}`)
        }
      }

      console.log(`\n✓ Migration ${migration} prepared (manual execution required)`)
    } catch (err: any) {
      console.error(`✗ Error reading ${migration}:`, err.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('IMPORTANT: Execute the SQL files manually in Supabase Dashboard')
  console.log('='.repeat(60))
  console.log('\n1. Go to: https://supabase.com/dashboard/project/fbloukfgdjvwzdgrcnzt/sql/new')
  console.log('2. Copy and execute each of these files:')
  migrations.forEach(m => console.log(`   - .backup_migrations/${m}`))
  console.log('\n3. Then refresh materialized views')
  console.log('\nAlternatively, use SQL below:\n')

  // Print quick test
  console.log('After migration, test with:')
  console.log('\nSELECT get_team_players_summary')
  console.log("  ((SELECT id FROM teams LIMIT 1),")
  console.log("   ARRAY[(SELECT id FROM series LIMIT 1)]::TEXT[]);")
}

runMigrations().catch(err => {
  console.error(err)
  process.exit(1)
})
