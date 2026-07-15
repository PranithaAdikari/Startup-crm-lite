import { validationResult } from 'express-validator';

/**
 * Middleware wrapper for express-validator schemas.
 * Sequentially or concurrently executes passed validation rules against the incoming request.
 * If validation fails, extracts and maps errors to a custom format and halts the chain.
 *
 * @param {Array<Object>} validations - Array of validation rules (e.g., body('email').isEmail()).
 * @returns {Function} Express middleware function.
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // 1. Run all express-validator chains
    await Promise.all(validations.map((validation) => validation.run(req)));

    // 2. Extract validation results
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // 3. Format errors as requested: [{ field, message }]
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param, // compatibility fallback (older versions use param, newer use path)
      message: err.msg,
    }));

    // 4. Return standard validation failure response
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  };
};

export default validate;
