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
  const isSupabase = process.env.DATABASE_URL.includes('supabase') || 
                     process.env.DATABASE_URL.includes('supabase.co') ||
                     process.env.DATABASE_URL.includes('pooler.supabase.com');
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Parse DATABASE_URL to check if it's a pooler connection
  const isPooler = process.env.DATABASE_URL.includes('pooler');
  
  // For Supabase, always use SSL
  // For production, use SSL if DATABASE_URL suggests it (most cloud providers require SSL)
  const requiresSSL = isSupabase || isProduction || isPooler;
  
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    // Enable SSL for Supabase, pooler connections, and production
    ssl: requiresSSL ? { 
      rejectUnauthorized: false,
      // Additional SSL options for better compatibility
      require: true
    } : false,
    // Connection pool settings - optimized for Supabase connection pooling
    max: parseInt(process.env.DB_POOL_MAX || (isSupabase || isPooler ? '10' : '20'), 10), // Supabase recommends smaller pools
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || (isSupabase || isPooler ? '20000' : '10000'), 10), // Increased for Supabase
    // Allow exit on idle to help with connection management
    allowExitOnIdle: false,
  };
  
  console.log('📊 Using DATABASE_URL for database connection');
  if (isSupabase || isPooler) {
    console.log('🔐 Supabase connection detected - SSL enabled');
    console.log('📡 Using optimized connection pool settings for Supabase');
    console.log('🔗 Connection type:', isPooler ? 'Pooler' : 'Direct');
  } else if (isProduction) {
    console.log('🔐 Production environment - SSL enabled');
  }
  
  // Log connection details (without sensitive info)
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('📍 Database host:', url.hostname);
    console.log('📍 Database port:', url.port || '5432');
    console.log('📍 Database name:', url.pathname?.replace('/', '') || 'N/A');
  } catch (e) {
    // URL parsing failed, skip logging
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

// Handle pool errors (don't exit on error, just log)
pool.on('error', (err, client) => {
  console.error('⚠️ Unexpected error on idle client:', err.message);
  console.error('   Error code:', err.code);
  console.error('   Error details:', err);
  
  // Only exit on critical errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    console.error('❌ Critical database connection error - server may be unreachable');
    // Don't exit immediately, let the application handle it gracefully
  }
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
const testConnection = async () => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ Database connection successful:', result.rows[0].now);
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.error('💡 Connection refused - Possible issues:');
        console.error('   1. Database server is not running or unreachable');
        console.error('   2. Firewall is blocking the connection');
        console.error('   3. DATABASE_URL is incorrect or expired');
        console.error('   4. Network connectivity issues');
        
        if (process.env.DATABASE_URL) {
          try {
            const url = new URL(process.env.DATABASE_URL);
            console.error('   5. Check if host is accessible:', url.hostname);
            console.error('   6. Check if port is open:', url.port || '5432');
          } catch (e) {
            // URL parsing failed
          }
        }
      } else if (error.code === 'ETIMEDOUT') {
        console.error('💡 Connection timeout - Possible issues:');
        console.error('   1. Database server is slow to respond');
        console.error('   2. Network latency is high');
        console.error('   3. Connection pool settings need adjustment');
      } else if (error.code === 'ENOTFOUND') {
        console.error('💡 Host not found - Check DATABASE_URL hostname');
      }
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying connection in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('💡 Make sure you have:');
        console.error('   1. Created a PostgreSQL database (Supabase/Render/etc.)');
        console.error('   2. Added DATABASE_URL environment variable');
        console.error('   3. Checked that the database is accessible from Render');
        console.error('   4. Verified SSL settings if using Supabase');
        return false;
      }
    }
  }
  
  return false;
};

/**
 * Execute a query with retry logic
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params, maxRetries = 2) => {
  const start = Date.now();
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.log('⚠️ Slow query detected:', { text, duration, rows: res.rowCount });
      }
      
      return res;
    } catch (error) {
      lastError = error;
      
      // Retry on connection errors
      if ((error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') && attempt < maxRetries) {
        console.warn(`⚠️ Database query failed (attempt ${attempt}/${maxRetries}), retrying...`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }
      
      // Don't retry on other errors (syntax errors, constraint violations, etc.)
      console.error('Database query error:', error.message);
      console.error('Query:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      console.error('Params:', params);
      console.error('Error code:', error.code);
      
      throw error;
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
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

