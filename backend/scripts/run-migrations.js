/**
 * Run Database Migrations
 * Executes all SQL migration files in order
 * 
 * Usage: node scripts/run-migrations.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, testConnection, close } = require('../config/database');

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
  
  try {
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
      }
    }
    
    console.log(`✅ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`, error.message);
    throw error;
  }
};

// Main function
const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed. Cannot run migrations.');
      process.exit(1);
    }
    
    // Get migration files
    const migrationFiles = getMigrationFiles();
    console.log(`📦 Found ${migrationFiles.length} migration file(s)`);
    
    if (migrationFiles.length === 0) {
      console.log('⚠️ No migration files found');
      return;
    }
    
    // Run migrations in order
    for (const file of migrationFiles) {
      await runMigration(file);
    }
    
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await close();
  }
};

// Run migrations
runMigrations();

