#!/usr/bin/env node
console.log('🔍 Checking Database Environment Variables...\n');

console.log('Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set (length: ' + process.env.DATABASE_URL.length + ')' : '❌ Not set');
console.log('PGHOST:', process.env.PGHOST || '❌ Not set');
console.log('PGPORT:', process.env.PGPORT || '❌ Not set'); 
console.log('PGDATABASE:', process.env.PGDATABASE || '❌ Not set');
console.log('PGUSER:', process.env.PGUSER || '❌ Not set');
console.log('PGPASSWORD:', process.env.PGPASSWORD ? '✅ Set (length: ' + process.env.PGPASSWORD.length + ')' : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

if (process.env.DATABASE_URL) {
  console.log('\n🔗 Parsed DATABASE_URL:');
  const url = new URL(process.env.DATABASE_URL);
  console.log('Host:', url.hostname);
  console.log('Port:', url.port);
  console.log('Database:', url.pathname.slice(1));
  console.log('Username:', url.username);
  console.log('Password:', url.password ? '***hidden***' : 'none');
  
  // Test basic connection
  console.log('\n🧪 Testing Database Connection...');
  
  import('pg').then(async ({ Pool }) => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    });
    
    try {
      const client = await pool.connect();
      console.log('✅ Connection successful!');
      
      const result = await client.query('SELECT version()');
      console.log('📊 PostgreSQL version:', result.rows[0].version.split(' ')[1]);
      
      client.release();
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
    } finally {
      await pool.end();
    }
  }).catch(console.error);
} else {
  console.log('\n❌ No DATABASE_URL found. Please set up Railway PostgreSQL environment variables.');
  console.log('\nTo fix this:');
  console.log('1. Go to your Railway dashboard');
  console.log('2. Click on your PostgreSQL service'); 
  console.log('3. Go to Variables tab');
  console.log('4. Copy the DATABASE_URL and set it as an environment variable');
}