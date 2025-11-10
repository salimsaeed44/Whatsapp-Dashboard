/**
 * Reset Database (Development/Testing Only)
 * ⚠️ WARNING: This will drop all tables and data!
 * Only use this in development/testing environments
 * 
 * Usage: node scripts/reset-database.js
 */

require('dotenv').config();
const { pool, testConnection, close } = require('../config/database');

const resetDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot reset database in production environment!');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    console.log('⚠️  WARNING: This will drop all tables and data!');
    console.log('🚀 Starting database reset...');

    // Get all table names
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
    `);

    const tables = tablesResult.rows.map(row => row.tablename);

    if (tables.length === 0) {
      console.log('✅ No tables to drop');
      return;
    }

    console.log(`📋 Found ${tables.length} table(s) to drop:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });

    // Drop all tables
    await client.query('BEGIN');
    try {
      // Drop all tables with CASCADE to handle foreign keys
      for (const table of tables) {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`   ✅ Dropped table: ${table}`);
      }
      await client.query('COMMIT');
      console.log('\n✅ Database reset completed successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    throw error;
  } finally {
    client.release();
    await close();
  }
};

// Test connection first
testConnection()
  .then(connected => {
    if (!connected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    return resetDatabase();
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });

