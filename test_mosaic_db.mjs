import postgres from 'postgres'

// Use Mosaic's DATABASE_URL
const DATABASE_URL = 'postgresql://postgres:Eaglestrike%23123@db.fbloukfgdjvwzdgrcnzt.supabase.co:5432/postgres'

const sql = postgres(DATABASE_URL, {
  max: 1,
  ssl: 'require',
  prepare: false,
})

async function testMosaicDB() {
  console.log('Testing Mosaic DATABASE_URL...\n')
  
  try {
    const result = await sql`SELECT 1 as test`
    console.log('✅ Basic query works:', result[0])
    
    const players = await sql`SELECT COUNT(*) as count FROM public.players`
    console.log('✅ Players count:', players[0])
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await sql.end()
  }
}

testMosaicDB()
