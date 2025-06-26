const pool = require("../config/db");

const Auth = {
  createUser: async (username, email, hashedPassword, role) => {
    const sql =
      "INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    try {
      const [result] = await pool.execute(sql, [
        username,
        email,
        hashedPassword,
        role,
      ]);
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  findUserByEmail: async (email) => {
    const sql =
      "SELECT user_id, username, email, password_hash, role, is_active FROM Users WHERE email = ?"; // Select specific columns including password_hash
    try {
      const [rows] = await pool.execute(sql, [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  },
};

module.exports = Auth;
