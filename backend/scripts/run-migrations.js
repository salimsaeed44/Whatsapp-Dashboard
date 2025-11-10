/**
 * Run Database Migrations
 * Executes all SQL migration files in order
 * 
 * Usage: node scripts/run-migrations.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, testConnection, close } = require('../config/database');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

// Get all migration files sorted by name
const getMigrationFiles = () => {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  return files;
};

// Read and execute a migration file
const runMigration = async (filename) => {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`📄 Running migration: ${filename}`);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Execute the entire SQL file as a single transaction
    // This handles complex SQL statements like CREATE FUNCTION properly
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log(`✅ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`);
    }
    throw error;
  } finally {
    client.release();
  }
};

// Main function
const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migrations...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    
    // Test database connection
    console.log('🔌 Testing database connection...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed. Cannot run migrations.');
      console.error('💡 Make sure DATABASE_URL is set correctly in environment variables.');
      process.exit(1);
    }
    
    // Get migration files
    const migrationFiles = getMigrationFiles();
    console.log(`📦 Found ${migrationFiles.length} migration file(s)`);
    
    if (migrationFiles.length === 0) {
      console.log('⚠️ No migration files found');
      return;
    }
    
    // List all migration files
    console.log('📋 Migration files to run:');
    migrationFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    // Run migrations in order
    console.log('\n🚀 Running migrations...\n');
    for (const file of migrationFiles) {
      await runMigration(file);
    }
    
    console.log('\n✅ All migrations completed successfully!');
    console.log('🎉 Database schema is ready!');
  } catch (error) {
    console.error('\n❌ Migration process failed:', error.message);
    console.error('💡 Check the error above for details.');
    process.exit(1);
  } finally {
    await close();
  }
};

// Run migrations
runMigrations();


