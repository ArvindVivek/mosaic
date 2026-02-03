import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyFix() {
  console.log('Applying fixes to Mosaic database...\n')

  // Read the fix SQL
  const fixSQL = fs.readFileSync('scripts/fix-strategies-summary.sql', 'utf-8')

  console.log('SQL to execute:')
  console.log('='.repeat(60))
  console.log(fixSQL)
  console.log('='.repeat(60))
  console.log('\nAttempting to execute via Supabase Management API...\n')

  // Extract project reference
  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1]

  if (!projectRef) {
    console.error('Could not extract project reference from URL')
    return
  }

  console.log(`Project: ${projectRef}`)
  console.log('\nTo apply this fix:')
  console.log(`1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`)
  console.log('2. Paste the SQL above')
  console.log('3. Click "Run"')
  console.log('\nOr execute the following command:')
  console.log(`\nsupabase db query "$(cat scripts/fix-strategies-summary.sql)" --project-ref ${projectRef}`)

  console.log('\n\nAlternatively, creating direct fix via Supabase API...\n')

  // Try to use Supabase's query API directly
  // This typically requires the management API key, not the service role key
  // For now, we'll provide instructions

  console.log('Note: Direct SQL execution via REST API is not available.')
  console.log('Please use the Supabase Dashboard SQL Editor.')
}

applyFix().catch(console.error)
