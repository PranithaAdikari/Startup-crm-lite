import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Middleware to protect routes by validating JSON Web Tokens (JWT).
 * Extracts the token from the "Authorization" header, verifies it, checks if the
 * user exists in the database (excluding the password hash), and attaches the user
 * object to the request.
 *
 * @async
 * @function protect
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object|void>} Returns an error response if authentication fails, or proceeds to next middleware.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract the token from Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Check if token exists
  if (!token) {
    return errorResponse(res, 'No token provided, access denied', 401);
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find user and project out password hash for security
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(
        res,
        'User belonging to this token no longer exists',
        401
      );
    }

    // 5. Attach the authenticated user to the request object
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT expiration specifically
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired, please login again', 401);
    }
    // Handle invalid token (malformed, bad signature, etc.)
    return errorResponse(res, 'Token is invalid', 401);
  }
};
