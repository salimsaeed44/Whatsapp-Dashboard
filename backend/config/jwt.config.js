/**
 * JWT Configuration
 * JWT token generation and verification utilities
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token
 * 
 * @param {Object} payload - User data to encode in token
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  // TODO: Implement JWT access token generation
  // 1. Define token payload (id, email, role)
  // 2. Set expiration time from environment variable (JWT_EXPIRES_IN)
  // 3. Sign token with JWT_SECRET
  // 4. Return token

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // TODO: Generate actual token
  // const token = jwt.sign(payload, secret, { expiresIn });
  // return token;

  // Placeholder
  return 'placeholder-jwt-token';
};

/**
 * Generate JWT refresh token
 * 
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  // TODO: Implement JWT refresh token generation
  // 1. Define token payload (id only, or minimal data)
  // 2. Set longer expiration time (e.g., 7d, 30d)
  // 3. Sign token with JWT_REFRESH_SECRET (different from access token secret)
  // 4. Return refresh token

  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  // TODO: Generate actual refresh token
  // const token = jwt.sign({ id: payload.id }, refreshSecret, { expiresIn });
  // return token;

  // Placeholder
  return 'placeholder-refresh-token';
};

/**
 * Verify JWT token
 * 
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification (optional, defaults to JWT_SECRET)
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, secret = null) => {
  // TODO: Implement JWT token verification
  // 1. Use provided secret or default to JWT_SECRET
  // 2. Verify token using jwt.verify()
  // 3. Return decoded payload
  // 4. Throw error if token is invalid or expired

  const verifySecret = secret || process.env.JWT_SECRET;

  if (!verifySecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // TODO: Verify actual token
  // const decoded = jwt.verify(token, verifySecret);
  // return decoded;

  // Placeholder
  return {
    id: 'placeholder-user-id',
    email: 'placeholder@example.com',
    role: 'user'
  };
};

/**
 * Decode JWT token without verification
 * Useful for debugging or getting token information
 * 
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload (not verified)
 */
const decodeToken = (token) => {
  // TODO: Implement token decoding
  // return jwt.decode(token);

  // Placeholder
  return {
    id: 'placeholder-user-id',
    email: 'placeholder@example.com',
    role: 'user'
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};

