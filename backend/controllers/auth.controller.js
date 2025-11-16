/**
 * Authentication Controller
 * Handles authentication business logic
 */

const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../config/jwt.config');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Request body:
 * - email: string (required)
 * - password: string (required, min 8 characters)
 * - username: string (optional)
 * - full_name: string (optional)
 * 
 * Response:
 * - 201: User created successfully
 * - 400: Validation error or user already exists
 * - 500: Server error
 */
const register = async (req, res) => {
  try {
    const { email, password, username, full_name, phone_number, role = 'user' } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Email and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Invalid email format' 
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: 'User with this email already exists' 
      });
    }

    // Check if username is provided and already exists
    if (username) {
      const existingUsername = await User.findUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ 
          error: 'User already exists',
          message: 'User with this username already exists' 
        });
      }
    }

    // Create user (password will be hashed in the model)
    const user = await User.createUser({
      email,
      password,
      username,
      full_name,
      phone_number,
      role
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Return user data (without password) and tokens
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        phone_number: user.phone_number,
        is_active: user.is_active,
        created_at: user.created_at
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error.message === 'Email already exists' || error.message === 'Username already exists') {
      return res.status(400).json({
        error: 'User already exists',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Request body:
 * - email: string (required) or username: string
 * - password: string (required)
 * 
 * Response:
 * - 200: Login successful, returns user and tokens
 * - 401: Invalid credentials
 * - 500: Server error
 */
const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate input
    if ((!email && !username) || !password) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Email/username and password are required' 
      });
    }

    // Find user by email or username
    const user = email 
      ? await User.findUserByEmail(email, true) // Include password for verification
      : await User.findUserByUsername(username, true);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password. Please check your credentials and try again.' 
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact an administrator.' 
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password. Please check your credentials and try again.' 
      });
    }

    // Update last_login
    await User.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Return user data (without password) and tokens
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        phone_number: user.phone_number,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Requires authentication (req.user is available from authenticate middleware)
 * 
 * Response:
 * - 200: Logout successful
 * - 401: Not authenticated
 * - 500: Server error
 */
const logout = async (req, res) => {
  try {
    // For now, client should delete tokens from storage
    // Server-side logout can be implemented when token blacklist is needed
    // In the future, we can implement token blacklisting using Redis or database

    res.status(200).json({
      message: 'Logout successful',
      note: 'Client should delete tokens from storage. Server-side token revocation will be implemented in the future.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Request body:
 * - refreshToken: string (required)
 * 
 * Response:
 * - 200: New access token generated
 * - 401: Invalid or expired refresh token
 * - 500: Server error
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Validate input
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Refresh token is required' 
      });
    }

    // Verify refresh token
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = verifyToken(refreshToken, refreshSecret);
    
    // Get user from database
    const user = await User.findUserById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'User not found or inactive' 
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Optionally generate new refresh token (token rotation)
    // For now, we'll reuse the same refresh token
    // In the future, we can implement token rotation for better security

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken // Return same refresh token for now
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.message === 'Token has expired' || error.message === 'Invalid token') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired refresh token'
      });
    }

    res.status(500).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Requires authentication (req.user is available from authenticate middleware)
 * 
 * Response:
 * - 200: User profile
 * - 401: Not authenticated
 * - 500: Server error
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        phone_number: user.phone_number,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      message: error.message
    });
  }
};

/**
 * Verify token validity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Request body:
 * - token: string (required)
 * 
 * Response:
 * - 200: Token is valid
 * - 401: Token is invalid or expired
 * - 500: Server error
 */
const verifyTokenEndpoint = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Token is required'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findUserById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found or inactive'
      });
    }

    res.status(200).json({
      message: 'Token is valid',
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      error: 'Token verification failed',
      message: error.message,
      valid: false
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  verifyTokenEndpoint
};
