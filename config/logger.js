// config/logger.js
const { createLogger, format, transports } = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, align } = format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Configure Winston logger
const logger = createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info", // Set log level based on environment
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    // If in development, add colorize for console output
    process.env.NODE_ENV === "development"
      ? colorize({ all: true })
      : format.uncolorize(),
    align(), // Align levels for cleaner console output
    logFormat // Use our custom format
  ),
  transports: [
    // Console transport (for development and general monitoring)
    new transports.Console(),
    // File transport for all info level and above logs
    new transports.File({
      filename: path.join(__dirname, "../logs/combined.log"), // Path to log file
      level: "info",
    }),
    // File transport for error level logs specifically
    new transports.File({
      filename: path.join(__dirname, "../logs/error.log"), // Separate error log file
      level: "error",
    }),
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../logs/exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../logs/rejections.log"),
    }),
  ],
});

// If not in production, log to console for debugging even during testing
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}

module.exports = logger;
