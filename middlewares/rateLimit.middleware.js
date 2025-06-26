const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/apiError");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: new ApiError(
    429,
    "Too many requests from this IP, please try again after 15 minutes."
  ),
  standardHeaders: true, // Return rate limit info in the `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` headers
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: new ApiError(
    429,
    "Too many authentication attempts from this IP, please try again after 5 minutes."
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
};
