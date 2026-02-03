#!/bin/bash

set -e

echo "===================================================================="
echo "Mosaic Database Fix Script"
echo "===================================================================="
echo ""

PROJECT_REF="fbloukfgdjvwzdgrcnzt"
SQL_EDITOR_URL="https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"

echo "This script will fix all remaining Mosaic data issues."
echo ""
echo "STEPS:"
echo "1. Open Supabase SQL Editor"
echo "2. Execute the fix SQL"
echo "3. Verify the fixes worked"
echo ""

# Check if we can open the browser
if command -v open &> /dev/null; then
    echo "Opening Supabase SQL Editor in your browser..."
    open "$SQL_EDITOR_URL"
    echo "✓ Browser opened"
else
    echo "Please open this URL manually:"
    echo "$SQL_EDITOR_URL"
fi

echo ""
echo "===================================================================="
echo "Copy and paste the following SQL into the editor:"
echo "===================================================================="
echo ""

cat scripts/complete-fix.sql

echo ""
echo "===================================================================="
echo "After executing the SQL, press Enter to verify the fixes..."
read -p ""

# Verify via Node.js
echo ""
echo "Verifying fixes..."
export $(cat .env.local | xargs)
npx tsx -e "
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function verify() {
  console.log('\nChecking materialized views...')

  const views = ['mv_player_core_stats', 'mv_player_agent_pool', 'mv_team_map_stats', 'mv_team_compositions']

  for (const view of views) {
    const { count } = await supabase.from(view).select('*', { count: 'exact', head: true })
    console.log(\`  ✓ \${view}: \${count} rows\`)
  }

  console.log('\nTesting RPC functions...')

  const { data: teams } = await supabase.from('teams').select('id').limit(1)
  const { data: series } = await supabase.from('series').select('id').limit(1)

  if (teams && series && teams.length > 0 && series.length > 0) {
    const { data: players, error: playersError } = await supabase.rpc('get_team_players_summary', {
      p_team_id: teams[0].id,
      p_series_ids: [series[0].id]
    })

    if (playersError) {
      console.log('  ✗ get_team_players_summary:', playersError.message)
    } else {
      console.log('  ✓ get_team_players_summary works!')
    }

    const { data: strategies, error: strategiesError } = await supabase.rpc('get_team_strategies_summary', {
      p_team_id: teams[0].id,
      p_series_ids: [series[0].id]
    })

    if (strategiesError) {
      console.log('  ✗ get_team_strategies_summary:', strategiesError.message)
    } else {
      console.log('  ✓ get_team_strategies_summary works!')
    }
  }

  console.log('\n✅ Verification complete!')
}

verify()
"

echo ""
echo "===================================================================="
echo "All done! Now start the Mosaic dev server to test:"
echo "  npm run dev"
echo "===================================================================="
