/**
 * User Model
 * Database model for users table
 */

const { query, transaction } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * User Model Schema
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - email: String (Unique, Required)
 * - username: String (Unique, Optional)
 * - password: String (Hashed, Required)
 * - role: Enum ['admin', 'user', 'supervisor', 'employee'] (Default: 'user')
 * - full_name: String (Optional)
 * - phone_number: String (Optional)
 * - is_active: Boolean (Default: true)
 * - created_at: Timestamp
 * - updated_at: Timestamp
 * - last_login: Timestamp (Optional)
 * - deleted_at: Timestamp (Optional)
 */

/**
 * Create a new user
 * @param {Object} userData - User data object
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password (will be hashed)
 * @param {string} [userData.username] - Username (optional)
 * @param {string} [userData.role] - User role (default: 'user')
 * @param {string} [userData.full_name] - Full name (optional)
 * @param {string} [userData.phone_number] - Phone number (optional)
 * @returns {Promise<Object>} Created user (without password)
 */
const createUser = async (userData) => {
  try {
    const {
      email,
      password,
      username = null,
      role = 'user',
      full_name = null,
      phone_number = null
    } = userData;

    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate role
    const validRoles = ['admin', 'user', 'supervisor', 'employee'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, username, password, role, full_name, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, username, role, full_name, phone_number, is_active, created_at, updated_at, last_login`,
      [email, username, hashedPassword, role, full_name, phone_number]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create user');
    }

    return result.rows[0];
  } catch (error) {
    // Handle duplicate email or username
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'users_email_key') {
        throw new Error('Email already exists');
      } else if (error.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      }
    }
    throw error;
  }
};

/**
 * Find user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const findUserById = async (userId) => {
  try {
    const result = await query(
      `SELECT id, email, username, role, full_name, phone_number, is_active, created_at, updated_at, last_login
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Find user by email
 * @param {string} email - User email
 * @param {boolean} includePassword - Include password in result (default: false)
 * @returns {Promise<Object|null>} User object or null
 */
const findUserByEmail = async (email, includePassword = false) => {
  try {
    const passwordField = includePassword ? ', password' : '';
    const result = await query(
      `SELECT id, email, username, role, full_name, phone_number, is_active, created_at, updated_at, last_login${passwordField}
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Find user by username
 * @param {string} username - Username
 * @param {boolean} includePassword - Include password in result (default: false)
 * @returns {Promise<Object|null>} User object or null
 */
const findUserByUsername = async (username, includePassword = false) => {
  try {
    const passwordField = includePassword ? ', password' : '';
    const result = await query(
      `SELECT id, email, username, role, full_name, phone_number, is_active, created_at, updated_at, last_login${passwordField}
       FROM users
       WHERE username = $1 AND deleted_at IS NULL`,
      [username]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (userId, updateData) => {
  try {
    const {
      email,
      username,
      password,
      role,
      full_name,
      phone_number,
      is_active,
      last_login
    } = updateData;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (password !== undefined) {
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }
    if (role !== undefined) {
      // Validate role
      const validRoles = ['admin', 'user', 'supervisor', 'employee'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(full_name);
    }
    if (phone_number !== undefined) {
      updates.push(`phone_number = $${paramIndex++}`);
      values.push(phone_number);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }
    if (last_login !== undefined) {
      updates.push(`last_login = $${paramIndex++}`);
      values.push(last_login);
    }

    if (updates.length === 0) {
      // No updates to perform, return current user
      return await findUserById(userId);
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add userId to values
    values.push(userId);

    const result = await query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING id, email, username, role, full_name, phone_number, is_active, created_at, updated_at, last_login`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('User not found or already deleted');
    }

    return result.rows[0];
  } catch (error) {
    // Handle duplicate email or username
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'users_email_key') {
        throw new Error('Email already exists');
      } else if (error.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      }
    }
    throw error;
  }
};

/**
 * Delete user (soft delete)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const deleteUser = async (userId) => {
  try {
    const result = await query(
      `UPDATE users
       SET is_active = false, deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [userId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all users with pagination and filters
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Number of users to return (default: 50)
 * @param {number} [options.offset] - Number of users to skip (default: 0)
 * @param {string} [options.role] - Filter by role
 * @param {boolean} [options.is_active] - Filter by active status
 * @param {boolean} [options.includeDeleted] - Include deleted users (default: false)
 * @returns {Promise<Object>} Object with users array and total count
 */
const getAllUsers = async (options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      role,
      is_active,
      includeDeleted = false
    } = options;

    // Build WHERE clause
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (!includeDeleted) {
      conditions.push(`deleted_at IS NULL`);
    }

    if (role) {
      conditions.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get users
    values.push(limit, offset);
    const result = await query(
      `SELECT id, email, username, role, full_name, phone_number, is_active, created_at, updated_at, last_login
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    return {
      users: result.rows,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify user password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw error;
  }
};

/**
 * Update user last login timestamp
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
const updateLastLogin = async (userId) => {
  try {
    return await updateUser(userId, { last_login: new Date() });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  findUserById,
  findUserByEmail,
  findUserByUsername,
  updateUser,
  deleteUser,
  getAllUsers,
  verifyPassword,
  updateLastLogin
};
