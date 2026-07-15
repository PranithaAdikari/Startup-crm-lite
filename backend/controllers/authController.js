import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Helper utility to sign JWT tokens.
 *
 * @param {string} userId - The Mongo ObjectId of the User.
 * @returns {string} Signed JSON Web Token.
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Registers a new user.
 * Checks for email uniqueness, creates the user, generates a JWT, and returns the response.
 *
 * @async
 * @function register
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response containing token and user profile.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if email already exists in database
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return errorResponse(res, 'Email already exists', 409);
    }

    // 2. Create new User document (pre-save hook hashes password)
    const user = await User.create({
      name,
      email,
      password,
    });

    // 3. Generate JWT
    const token = generateToken(user._id);

    // 4. Strip sensitive fields (defense-in-depth)
    const userObj = user.toJSON();

    return successResponse(
      res,
      { token, user: userObj },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticates a user with email and password.
 * Checks account activation state, performs crypt comparison, and returns token on success.
 *
 * @async
 * @function login
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response containing token and user profile.
 */
export const login = async (req, res, next) => {
  /*
   * PRODUCTION NOTE:
   * To prevent brute-force attacks on the authentication endpoint,
   * a rate limiter middleware (e.g. `express-rate-limit`) should be
   * applied to the POST /login route in server.js or authRoutes.js.
   * Example configuration:
   * const loginRateLimiter = rateLimit({
   *   windowMs: 15 * 60 * 1000, // 15 minutes
   *   max: 5, // Limit each IP to 5 login requests per windowMs
   *   message: 'Too many login attempts, please try again after 15 minutes'
   * });
   */

  try {
    const { email, password } = req.body;

    // 1. Find user by email and explicitly include password for validation
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // General message to avoid exposing whether email or password was wrong
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // 2. Check password matches using the comparePassword instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // 3. Check if user account is deactivated
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    // 4. Generate JWT
    const token = generateToken(user._id);

    // 5. Build response user object (strip password explicitly)
    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(
      res,
      { token, user: userObj },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns the currently authenticated user's profile details.
 *
 * @async
 * @function getProfile
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response containing user profile.
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user has already been populated and sanitized of password by protect middleware
    return successResponse(res, req.user, 'Profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the authenticated user's profile.
 * Only allows updating "name". If a new password is provided,
 * verifies the current password first, hashes the new password, and saves the changes.
 *
 * @async
 * @function updateProfile
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response containing updated user profile.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    
    // Fetch the user from the database again, retrieving the password for verification
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // 1. Allow updating name only (ignore direct updates to email/roles)
    if (name) {
      user.name = name;
    }

    // 2. Handle password update request
    if (newPassword) {
      if (!currentPassword) {
        return errorResponse(
          res,
          'Current password is required to change password',
          400
        );
      }

      // Verify correct old password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return errorResponse(res, 'Incorrect current password', 401);
      }

      // Set new password (the pre-save mongoose middleware hashes this before saving)
      user.password = newPassword;
    }

    // 3. Save modifications
    await user.save();

    // 4. Return sanitized user object
    const updatedUser = user.toObject();
    delete updatedUser.password;

    return successResponse(
      res,
      updatedUser,
      'Profile updated successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Controller-based session logout handler (Stateless JWT clean response).
 *
 * @async
 * @function logout
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response confirming logout.
 */
export const logout = async (req, res, next) => {
  try {
    return successResponse(res, null, 'Logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};
