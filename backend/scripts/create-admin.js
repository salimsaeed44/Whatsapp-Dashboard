/**
 * Create Admin User Script
 * Creates a default admin user in the database
 * 
 * Usage: node scripts/create-admin.js
 */

require('dotenv').config();
const { query } = require('../config/database');
const bcrypt = require('bcrypt');

const DEFAULT_ADMIN = {
  email: 'admin@whatsapp-dashboard.com',
  username: 'admin',
  password: 'admin123456', // Change this in production!
  role: 'admin',
  full_name: 'System Administrator',
  is_active: true
};

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    // Check if admin user already exists
    const existingUser = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [DEFAULT_ADMIN.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️ Admin user already exists:', existingUser.rows[0].email);
      console.log('💡 To update password, use: UPDATE users SET password = $1 WHERE email = $2');
      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

    // Insert admin user
    const result = await query(
      `INSERT INTO users (email, username, password, role, full_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, username, role, full_name, is_active, created_at`,
      [
        DEFAULT_ADMIN.email,
        DEFAULT_ADMIN.username,
        hashedPassword,
        DEFAULT_ADMIN.role,
        DEFAULT_ADMIN.full_name,
        DEFAULT_ADMIN.is_active
      ]
    );

    const user = result.rows[0];
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Username:', user.username);
    console.log('🔑 Password:', DEFAULT_ADMIN.password);
    console.log('👑 Role:', user.role);
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');
    console.log('🔗 Login credentials:');
    console.log('   Email:', DEFAULT_ADMIN.email);
    console.log('   Password:', DEFAULT_ADMIN.password);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.constraint === 'users_email_key') {
      console.error('⚠️  User with this email already exists');
    } else if (error.constraint === 'users_username_key') {
      console.error('⚠️  User with this username already exists');
    } else {
      console.error('📋 Full error:', error);
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run script
createAdminUser();

