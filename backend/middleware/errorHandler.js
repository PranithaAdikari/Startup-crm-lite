import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Express error handling middleware.
 * Intercepts all unhandled errors thrown during request processing, formats them
 * into standardized JSON API error responses, and manages log output and stack trace exposure.
 *
 * @param {Error} err - The error object thrown.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  // Always log the error details in development mode for easier debugging
  // Log the error details to the terminal for debugging
  console.error('Backend Error Details:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  // 1. Handle Mongoose Validation Error (ValidationError)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = {};
    // Extract field-by-field error messages
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // 2. Handle Mongoose CastError (invalid ObjectId structure)
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // 3. Handle MongoDB Duplicate Key Error (Code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already exists';
  }

  // 4. Handle JSON Web Token Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Unauthorized: Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Unauthorized: Token has expired';
  }

  // Determine error payload to send
  let errorPayload = errors;
  if (process.env.NODE_ENV === 'development') {
    // In development mode, append the stack trace and error message for easier troubleshooting
    errorPayload = errorPayload && typeof errorPayload === 'object'
      ? { ...errorPayload, stack: err.stack }
      : { message: err.message, stack: err.stack };
  }

  // Use the standardized apiResponse helper for the error response
  return errorResponse(res, message, statusCode, errorPayload);
};

export default errorHandler;
