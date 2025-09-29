#!/usr/bin/env node
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection using Railway environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  console.log('🗄️ Initializing Carmen Sandiego Database...');
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'complete_setup.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('✅ Database schema created successfully');
    
    client.release();
    
    // Test sample queries
    console.log('🧪 Testing database with sample queries...');
    
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users table: ${usersResult.rows[0].count} records`);
    
    const villainsResult = await pool.query('SELECT COUNT(*) as count FROM villains');
    console.log(`🦹 Villains table: ${villainsResult.rows[0].count} records`);
    
    const casesResult = await pool.query('SELECT COUNT(*) as count FROM cases');
    console.log(`📂 Cases table: ${casesResult.rows[0].count} records`);
    
    const locationsResult = await pool.query('SELECT COUNT(*) as count FROM locations');
    console.log(`🌍 Locations table: ${locationsResult.rows[0].count} records`);
    
    console.log('🎉 Database initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Start the API server: npm run dev:api');
    console.log('2. Test villains endpoint: curl http://localhost:3001/api/villains');
    console.log('3. Test cases endpoint: curl http://localhost:3001/api/cases');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check that DATABASE_URL is set correctly');
    console.error('2. Verify Railway PostgreSQL is running');
    console.error('3. Check network connectivity to Railway');
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase().catch(console.error);