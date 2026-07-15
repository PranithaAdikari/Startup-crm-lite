/**
 * Sends a successful JSON response with a standardized structure.
 *
 * @param {Object} res - Express response object.
 * @param {any} data - The payload to be sent in the response.
 * @param {string} message - A developer/user friendly message describing the result.
 * @param {number} [statusCode=200] - The HTTP status code to return.
 * @returns {Object} Express JSON response.
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends an error JSON response with a standardized structure.
 *
 * @param {Object} res - Express response object.
 * @param {string} message - Error description message.
 * @param {number} [statusCode=500] - The HTTP status code to return.
 * @param {any} [errors=null] - Detailed error objects (e.g. field-specific validation errors).
 * @returns {Object} Express JSON response.
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Sends a paginated successful JSON response with metadata.
 *
 * @param {Object} res - Express response object.
 * @param {Array} data - The page of records to return.
 * @param {number} total - The total number of records matching the query in the database.
 * @param {number} page - The current page index (1-based).
 * @param {number} limit - The maximum number of records per page.
 * @returns {Object} Express JSON response.
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  const pages   = Math.ceil(total / limit) || 0;
  const hasNext = page < pages;
  const hasPrev = page > 1;
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNext,
      hasPrev,
    },
  });
};
