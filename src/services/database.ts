import { Pool } from 'pg';

// Prefer DATABASE_URL, but allow individual PG* vars too
const hasDatabaseUrl = !!process.env.DATABASE_URL;
const usingUrl = hasDatabaseUrl ? 'DATABASE_URL' : 'PG* variables';

// Decide if SSL should be used
function resolveSSLOption(): false | { rejectUnauthorized: false } {
  // Explicit overrides
  const sslEnv = (process.env.DATABASE_SSL || '').toLowerCase();
  if (['false', '0', 'off', 'disable'].includes(sslEnv)) return false;
  if (['true', '1', 'on', 'require', 'enabled'].includes(sslEnv)) return { rejectUnauthorized: false };

  const pgSslMode = (process.env.PGSSLMODE || '').toLowerCase();
  if (pgSslMode === 'disable') return false;
  if (pgSslMode === 'require') return { rejectUnauthorized: false };

  const url = process.env.DATABASE_URL || '';
  if (/sslmode=require/i.test(url) || /[?&]ssl=true/i.test(url)) {
    return { rejectUnauthorized: false };
  }

  const host = (process.env.PGHOST || '').toLowerCase();
  // For internal/private networks, SSL is usually unnecessary and sometimes unsupported
  if (host.endsWith('.railway.internal') || host === 'localhost' || host === '127.0.0.1') {
    return false;
  }

  // Default: use SSL only in production when not clearly internal
  return process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
}

const sslOption = resolveSSLOption();

// Build config from env
const config = hasDatabaseUrl
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: sslOption,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || process.env.POSTGRES_USER,
      password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
      database: process.env.PGDATABASE || process.env.POSTGRES_DB,
      ssl: sslOption,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    } as any;

// Create the connection pool
export const pool = new Pool(config);

// Test the connection
export const testConnection = async (): Promise<boolean> => {
  if (!hasDatabaseUrl && !process.env.PGHOST) {
    console.log('⚠️ No database env configured (missing DATABASE_URL or PG* vars)');
    return false;
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log(`✅ Database connection successful via ${usingUrl}`);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error?.message || error);
    if (error?.code) console.error('DB error code:', error.code);
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