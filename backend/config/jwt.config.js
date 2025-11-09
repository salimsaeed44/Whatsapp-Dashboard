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
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };

  const token = jwt.sign(tokenPayload, secret, { expiresIn });
  return token;
};

/**
 * Generate JWT refresh token
 * 
 * @param {Object} payload - User data to encode in token
 * @param {string} payload.id - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  const tokenPayload = {
    id: payload.id
  };

  const token = jwt.sign(tokenPayload, refreshSecret, { expiresIn });
  return token;
};

/**
 * Verify JWT token
 * 
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification (optional, defaults to JWT_SECRET)
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, secret = null) => {
  const verifySecret = secret || process.env.JWT_SECRET;

  if (!verifySecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, verifySecret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

/**
 * Decode JWT token without verification
 * Useful for debugging or getting token information
 * 
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload (not verified)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Failed to decode token');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};
