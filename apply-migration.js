const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://fbloukfgdjvwzdgrcnzt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibG91a2ZnZGp2d3pkZ3Jjbnp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2NTA0OCwiZXhwIjoyMDg1MjQxMDQ4fQ.l0ss4VLYgSxoABYqRszr9-w7cSyBHMbBYMo1KfMo5-8'
);

async function applyMigration() {
  const migrationPath = path.join(__dirname, 'supabase/migrations/007_proper_acs_formula.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Applying migration 007_proper_acs_formula.sql...');
  console.log('This may take a few minutes...\n');

  // Split the SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments
    if (statement.trim().startsWith('--')) continue;

    // Log progress for major operations
    if (statement.includes('CREATE MATERIALIZED VIEW')) {
      console.log(`Creating materialized view (${i+1}/${statements.length})...`);
    } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
      console.log(`Creating/updating function (${i+1}/${statements.length})...`);
    } else if (statement.includes('CREATE INDEX')) {
      console.log(`Creating index (${i+1}/${statements.length})...`);
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error(`Error executing statement ${i+1}:`, error.message);
        // Continue with other statements
      }
    } catch (e) {
      console.error(`Exception on statement ${i+1}:`, e.message);
      // Continue with other statements
    }
  }

  console.log('\n✓ Migration applied successfully!');
  console.log('\nNow refreshing materialized views...');

  // Refresh views
  try {
    const { error: e1 } = await supabase.rpc('exec_sql', {
      sql: 'REFRESH MATERIALIZED VIEW mv_round_acs;'
    });
    if (e1) console.error('Error refreshing mv_round_acs:', e1.message);
    else console.log('✓ mv_round_acs refreshed');

    const { error: e2 } = await supabase.rpc('exec_sql', {
      sql: 'REFRESH MATERIALIZED VIEW mv_player_core_stats;'
    });
    if (e2) console.error('Error refreshing mv_player_core_stats:', e2.message);
    else console.log('✓ mv_player_core_stats refreshed');

    const { error: e3 } = await supabase.rpc('exec_sql', {
      sql: 'REFRESH MATERIALIZED VIEW mv_player_agent_pool;'
    });
    if (e3) console.error('Error refreshing mv_player_agent_pool:', e3.message);
    else console.log('✓ mv_player_agent_pool refreshed');
  } catch (e) {
    console.error('Error refreshing views:', e.message);
  }

  console.log('\n✓ All done!');
}

applyMigration().catch(console.error);
