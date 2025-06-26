
const ApiError = require('../utils/apiError');

/**
 * Global error handling middleware.
 * Catches errors, logs them, and sends a consistent JSON response.
 */
const errorMiddleware = (err, req, res, next) => {
  // Log the error for debugging purposes (use a proper logger in production)
  console.error("--- API Error Caught ---");
  console.error("Path:", req.path);
  console.error("Method:", req.method);
  console.error("Error:", err);
  if (err.stack) {
    console.error("Stack:", err.stack);
  }
  console.error("------------------------");

  // Determine the status code and message
  let statusCode = err.statusCode || 500; // Default to 500 Internal Server Error
  let message = err.message || 'Something went wrong on the server.';
  let errors = err.errors || []; // Array for detailed errors (e.g., Joi)

  // Handle specific types of errors if needed
  // For example, if it's a database error that's not an ApiError
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
    errors = [{ field: 'token', message: 'Invalid token' }];
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please login again.';
    errors = [{ field: 'token', message: 'Token expired' }];
  }
  // Add more specific error handling for common errors (e.g., specific DB error codes
  // that you want to catch globally rather than in every controller)

  // In production, avoid sending detailed error stack traces to clients
  // For development, you might include the stack
  const response = {
    message: message,
    errors: errors.length > 0 ? errors : undefined, // Only include 'errors' if there are details
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optional: show stack in dev
  };

  // Send the error response
  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;