import { Pool } from 'pg';

// Database configuration
const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/sourdough_pete',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create the connection pool
export const pool = new Pool(config);

// Test the connection
export const testConnection = async (): Promise<boolean> => {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ No DATABASE_URL configured');
    return false;
  }
  
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Execute a query with parameters
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Execute multiple queries in a transaction
export const transaction = async (queries: { text: string; params?: any[] }[]): Promise<any[]> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown
export const shutdown = async (): Promise<void> => {
  await pool.end();
  console.log('Database pool has ended');
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);