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

// Execute a single SQL statement with error handling
const executeStatement = async (client, statement, index) => {
  const trimmed = statement.trim();
  if (!trimmed || trimmed === ';' || trimmed.startsWith('--')) {
    return;
  }
  
  try {
    await client.query(trimmed);
  } catch (error) {
    // Skip if object already exists (idempotent migrations)
    if (error.code === '42P07' || error.code === '42710' || error.code === '42723' ||
        error.message.includes('already exists') || 
        error.message.includes('duplicate key value') ||
        (error.message.includes('constraint') && error.message.includes('already exists'))) {
      console.log(`   ⚠️  Statement ${index + 1} skipped (already exists)`);
      return;
    }
    throw error;
  }
};

// Split SQL into statements, preserving dollar-quoted blocks
const splitSQLStatements = (sql) => {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let i = 0;
  
  while (i < sql.length) {
    const char = sql[i];
    const nextChar = sql[i + 1];
    
    // Check for dollar quote ($$)
    if (char === '$' && nextChar === '$') {
      inDollarQuote = !inDollarQuote;
      current += char + nextChar;
      i += 2;
      continue;
    }
    
    current += char;
    
    // If we're not in a dollar quote and hit semicolon, end the statement
    if (!inDollarQuote && char === ';') {
      const statement = current.trim();
      if (statement && statement !== ';' && !statement.startsWith('--')) {
        statements.push(statement);
      }
      current = '';
    }
    
    i++;
  }
  
  // Add remaining statement
  if (current.trim() && !current.trim().startsWith('--')) {
    statements.push(current.trim());
  }
  
  return statements.filter(s => s.length > 0);
};

// Read and execute a migration file
const runMigration = async (filename) => {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  let sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`📄 Running migration: ${filename}`);
  
  // Remove comments (lines starting with --) but preserve dollar-quoted content
  const lines = sql.split('\n');
  const cleanedLines = [];
  let inDollarQuote = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if line contains dollar quote
    if (trimmed.includes('$$')) {
      inDollarQuote = !inDollarQuote;
      cleanedLines.push(line);
      continue;
    }
    
    // Skip comments only if not in dollar quote
    if (!inDollarQuote && trimmed.startsWith('--')) {
      continue; // Skip comment lines
    }
    
    cleanedLines.push(line);
  }
  
  sql = cleanedLines.join('\n');
  
  const client = await pool.connect();
  try {
    // Check if migration contains CREATE EXTENSION
    const hasExtension = sql.toLowerCase().includes('create extension');
    
    if (hasExtension) {
      // Extract and execute CREATE EXTENSION separately (cannot be in transaction)
      const extensionMatch = sql.match(/CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+"?([^"\s;]+)"?/i);
      if (extensionMatch) {
        try {
          await client.query(`CREATE EXTENSION IF NOT EXISTS "${extensionMatch[1]}"`);
          console.log(`   ✅ Extension created: ${extensionMatch[1]}`);
        } catch (error) {
          if (error.code === '42710' || error.message.includes('already exists')) {
            console.log(`   ⚠️  Extension already exists: ${extensionMatch[1]}`);
          } else {
            throw error;
          }
        }
      }
      
      // Remove CREATE EXTENSION from SQL
      sql = sql.replace(/CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+"?[^"\s;]+"?;?\s*/gi, '').trim();
    }
    
    if (!sql || !sql.trim()) {
      console.log(`✅ Migration completed: ${filename}`);
      return true;
    }
    
    // Split SQL into statements
    const statements = splitSQLStatements(sql);
    
    if (statements.length === 0) {
      console.log(`   ⚠️  No statements found`);
      console.log(`✅ Migration completed: ${filename}`);
      return true;
    }
    
    console.log(`   Found ${statements.length} statement(s)`);
    
    // Execute statements one by one (not in transaction to handle functions properly)
    for (let i = 0; i < statements.length; i++) {
      await executeStatement(client, statements[i], i + 1);
    }
    
    console.log(`✅ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`);
    }
    if (error.position) {
      console.error(`   Position: ${error.position}`);
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
