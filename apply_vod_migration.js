const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Eaglestrike%23123@db.fbloukfgdjvwzdgrcnzt.supabase.co:5432/postgres'
});

const sql = fs.readFileSync('supabase/migrations/004_vod_analysis.sql', 'utf8');

console.log('Applying VOD migration to production database...');
console.log('SQL length:', sql.length, 'characters\n');

(async () => {
  try {
    await pool.query(sql);
    console.log('✅ VOD migration applied successfully!\n');
    
    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'vod%'
      ORDER BY table_name;
    `);
    
    console.log('✅ VOD tables created in production:');
    result.rows.forEach(row => console.log('  -', row.table_name));
    
    // Check sample data
    const count = await pool.query('SELECT COUNT(*) FROM public.vod_metadata;');
    console.log('\n✅ Sample VOD records:', count.rows[0].count);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
})();
