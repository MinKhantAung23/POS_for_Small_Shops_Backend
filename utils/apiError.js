/**
 * Custom error class for API errors.
 * Allows specifying an HTTP status code and an array of errors for consistent responses.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // For detailed error messages (e.g., Joi validation errors)
    this.isOperational = true; // Indicates errors that are expected and handled programmatically

    // Capture stack trace, excluding the constructor call itself
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
