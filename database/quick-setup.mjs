// Quick database connection test and setup
import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('Make sure .env.local file exists with DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('amazonaws.com') || DATABASE_URL.includes('rlwy.net') ? { rejectUnauthorized: false } : false,
  statement_timeout: 30000,
  query_timeout: 30000,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

async function setupDatabase() {
  console.log('🔄 Testing database connection...');
  
  try {
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    client.release();

    // Check if tables exist
    console.log('🔄 Checking existing tables...');
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`Found ${tableCheck.rows.length} existing tables:`, 
      tableCheck.rows.map(r => r.table_name));

    // Run complete setup if no tables exist
    if (tableCheck.rows.length === 0) {
      console.log('🔄 Running complete database setup...');
      const setupSQL = fs.readFileSync(join(__dirname, 'complete_setup.sql'), 'utf8');
      await pool.query(setupSQL);
      console.log('✅ Database schema created successfully!');

      // Add sample data
      console.log('🔄 Adding sample data...');
      const sampleSQL = fs.readFileSync(join(__dirname, 'sample_data.sql'), 'utf8');
      await pool.query(sampleSQL);
      console.log('✅ Sample data added successfully!');
    } else {
      console.log('✅ Database tables already exist, skipping setup');
    }

    // Test a query
    console.log('🔄 Testing game data query...');
    const villainsTest = await pool.query('SELECT name FROM villains LIMIT 3');
    console.log(`✅ Found ${villainsTest.rows.length} villains:`, 
      villainsTest.rows.map(v => v.name));

    console.log('\n🎉 Database is ready for Carmen Sandiego game!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();