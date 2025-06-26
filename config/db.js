require("dotenv").config();
const mysql = require("mysql2/promise");
const logger = require("./logger");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//  Test connection on startup for confirmation
pool
  .getConnection()
  .then((connection) => {
    console.log("🎉 DB initialized and connected!");
    logger.info('Successfully connected to the database!');
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Failed to initialize DB:", err.message);
    logger.error('Failed to connect to the database:', err.message);
    process.exit(1);
  });

module.exports = pool;
