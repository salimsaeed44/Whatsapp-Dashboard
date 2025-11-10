/**
 * Database Configuration
 * PostgreSQL connection pool setup
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database configuration
// Render provides DATABASE_URL automatically when you add a PostgreSQL database
// Format: postgres://user:password@host:port/database
let dbConfig;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if provided (Render, Heroku, Supabase, etc.)
  // Supabase requires SSL, so we enable it for all DATABASE_URL connections
  const isSupabase = process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('supabase.co');
  const isProduction = process.env.NODE_ENV === 'production';
  
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    // Enable SSL for production and Supabase (both require SSL)
    ssl: (isProduction || isSupabase) ? { rejectUnauthorized: false } : false,
    // Connection pool settings - optimized for Supabase connection pooling
    max: parseInt(process.env.DB_POOL_MAX || (isSupabase ? '10' : '20'), 10), // Supabase recommends smaller pools
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || (isSupabase ? '15000' : '10000'), 10), // Increased for Supabase
  };
  
  console.log('📊 Using DATABASE_URL for database connection');
  if (isSupabase) {
    console.log('🔐 Supabase connection detected - SSL enabled');
    console.log('📡 Using optimized connection pool settings for Supabase');
  }
} else {
  // Fallback to individual environment variables (local development)
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || process.env.POSTGRES_DB || 'whatsapp_db',
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
    // Connection pool settings
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10),
  };
  console.log('📊 Using individual DB environment variables for database connection');
}

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Make sure you have:');
    console.error('   1. Created a PostgreSQL database on Render');
    console.error('   2. Added DATABASE_URL environment variable (auto-added by Render)');
    console.error('   3. Or set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD for local development');
    return false;
  }
};

/**
 * Execute a query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.log('⚠️ Slow query detected:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Client object
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('⚠️ A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);
  
  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query(...args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };
  
  return client;
};

/**
 * Execute a transaction
 * @param {Function} callback - Transaction callback function
 * @returns {Promise<any>} Transaction result
 */
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Close the connection pool
 * @returns {Promise<void>}
 */
const close = async () => {
  try {
    await pool.end();
    console.log('✅ Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database connection pool:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  close,
};

