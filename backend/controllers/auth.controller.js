/**
 * Authentication Controller
 * Handles authentication business logic
 */

// TODO: Import required modules
// const User = require('../models/user.model');
// const { generateAccessToken, generateRefreshToken, verifyToken } = require('../config/jwt.config');
// const bcrypt = require('bcrypt');

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
    // TODO: Implement user registration
    // 1. Validate input data (email, password, etc.)
    // 2. Check if user with email already exists
    // 3. Hash password using bcrypt
    // 4. Create user in database using User model
    // 5. Generate JWT access token and refresh token
    // 6. Return user data (without password) and tokens
    //    Response format: { user: {...}, accessToken: '...', refreshToken: '...' }
    
    const { email, password, username, full_name } = req.body;

    // TODO: Add validation
    // if (!email || !password) {
    //   return res.status(400).json({ error: 'Email and password are required' });
    // }

    // TODO: Check if user exists
    // const existingUser = await User.findUserByEmail(email);
    // if (existingUser) {
    //   return res.status(400).json({ error: 'User with this email already exists' });
    // }

    // TODO: Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Create user
    // const user = await User.createUser({
    //   email,
    //   password: hashedPassword,
    //   username,
    //   full_name,
    //   role: 'user'
    // });

    // TODO: Generate tokens
    // const accessToken = generateAccessToken({
    //   id: user.id,
    //   email: user.email,
    //   role: user.role
    // });
    // const refreshToken = generateRefreshToken({ id: user.id });

    // Placeholder response
    res.status(501).json({
      message: 'Register function - Not implemented yet',
      data: { email, username, full_name }
    });
  } catch (error) {
    console.error('Registration error:', error);
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
    // TODO: Implement user login
    // 1. Validate input data (email/username and password)
    // 2. Find user by email or username using User model
    // 3. Check if user exists and is active
    // 4. Verify password using bcrypt.compare()
    // 5. Update last_login timestamp
    // 6. Generate JWT access token and refresh token
    // 7. Return user data (without password) and tokens
    //    Response format: { user: {...}, accessToken: '...', refreshToken: '...' }
    
    const { email, username, password } = req.body;

    // TODO: Add validation
    // if ((!email && !username) || !password) {
    //   return res.status(400).json({ error: 'Email/username and password are required' });
    // }

    // TODO: Find user
    // const user = email 
    //   ? await User.findUserByEmail(email)
    //   : await User.findUserByUsername(username);
    
    // if (!user) {
    //   return res.status(401).json({ error: 'Invalid credentials' });
    // }

    // if (!user.is_active) {
    //   return res.status(401).json({ error: 'Account is deactivated' });
    // }

    // TODO: Verify password
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ error: 'Invalid credentials' });
    // }

    // TODO: Update last_login
    // await User.updateUser(user.id, { last_login: new Date() });

    // TODO: Generate tokens
    // const accessToken = generateAccessToken({
    //   id: user.id,
    //   email: user.email,
    //   role: user.role
    // });
    // const refreshToken = generateRefreshToken({ id: user.id });

    // Placeholder response
    res.status(501).json({
      message: 'Login function - Not implemented yet',
      data: { email, username }
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
    // TODO: Implement user logout
    // Option 1: Token blacklist (store invalidated tokens in database/cache)
    // 1. Extract token from request
    // 2. Add token to blacklist (Redis, database, or in-memory store)
    // 3. Set expiration for blacklisted token (same as token expiration)
    
    // Option 2: Refresh token revocation
    // 1. If refresh token is provided, revoke it
    // 2. Store revoked refresh tokens in database
    
    // Option 3: Session invalidation (if using sessions)
    // 1. Destroy session
    
    // For now, client should delete tokens from storage
    // Server-side logout can be implemented when token blacklist is needed

    // TODO: Extract token from request
    // const token = req.headers.authorization?.substring(7);
    // if (token) {
    //   // Add to blacklist
    //   await TokenBlacklist.add(token);
    // }

    // Placeholder response
    res.status(200).json({
      message: 'Logout successful',
      note: 'Client should delete tokens from storage'
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
    // TODO: Implement token refresh
    // 1. Get refresh token from request body
    // 2. Verify refresh token using JWT_REFRESH_SECRET
    // 3. Check if refresh token is revoked (if using revocation)
    // 4. Get user data from token or database
    // 5. Generate new access token
    // 6. Optionally: Generate new refresh token (rotation)
    // 7. Return new tokens
    
    const { refreshToken } = req.body;

    // TODO: Add validation
    // if (!refreshToken) {
    //   return res.status(400).json({ error: 'Refresh token is required' });
    // }

    // TODO: Verify refresh token
    // const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // TODO: Check if token is revoked
    // const isRevoked = await TokenRevocation.isRevoked(refreshToken);
    // if (isRevoked) {
    //   return res.status(401).json({ error: 'Refresh token has been revoked' });
    // }

    // TODO: Get user from database
    // const user = await User.findUserById(decoded.id);
    // if (!user || !user.is_active) {
    //   return res.status(401).json({ error: 'User not found or inactive' });
    // }

    // TODO: Generate new access token
    // const accessToken = generateAccessToken({
    //   id: user.id,
    //   email: user.email,
    //   role: user.role
    // });

    // TODO: Optionally rotate refresh token (generate new one and revoke old)
    // const newRefreshToken = generateRefreshToken({ id: user.id });
    // await TokenRevocation.revoke(refreshToken);

    // Placeholder response
    res.status(501).json({
      message: 'Refresh token function - Not implemented yet',
      data: { refreshToken }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken
};

