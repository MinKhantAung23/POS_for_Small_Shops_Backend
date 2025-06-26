const pool = require("../config/db");

const User = {
  createUser: async (
    username,
    email,
    hashedPassword,
    role,
    is_active = 1,
    avatar_url = null
  ) => {
    const sql = `
    INSERT INTO Users (username, email, password_hash, role, is_active, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    try {
      const [result] = await pool.execute(sql, [
        username,
        email,
        hashedPassword,
        role,
        is_active,
        avatar_url,
      ]);
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  getAllUsers: async ({
    page = 1,
    limit = 10,
    search = "",
    role = "",
    isActive = "",
    sortBy = "created_at",
    sortOrder = "DESC",
  }) => {
    const offset = (page - 1) * limit;

    const allowedSortFields = [
      "username",
      "email",
      "role",
      "is_active",
      "created_at",
    ];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const conditions = [];
    const values = [];

    if (search) {
      conditions.push("(username LIKE ? OR email LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      conditions.push("role = ?");
      values.push(role);
    }

    if (isActive !== "") {
      conditions.push("is_active = ?");
      values.push(Number(isActive)); // Convert to 0/1
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countSql = `
    SELECT COUNT(*) AS total FROM Users ${whereClause}
  `;

    const userSql = `
    SELECT user_id, username, email, role, is_active, created_at, avatar_url
    FROM Users
    ${whereClause}
    ORDER BY ${finalSortBy} ${finalSortOrder}
    LIMIT ? OFFSET ?
  `;

    try {
      const [[countResult]] = await pool.query(countSql, values);
      const totalCount = countResult.total;
      const totalPages = Math.ceil(totalCount / limit);

      const [users] = await pool.query(userSql, [...values, limit, offset]);

      return {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Error in getAllUsers model:", error);
      throw error;
    }
  },

  updateUser: async (userId, updateData) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    const sql = `
    UPDATE Users
    SET ${fields.join(", ")}
    WHERE user_id = ?
  `;

    try {
      const [result] = await pool.execute(sql, [...values, userId]);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in updateUser model:", error);
      throw error;
    }
  },

  updateUserPassword: async (userId, hashedPassword) => {
    const sql = `UPDATE Users SET password_hash = ? WHERE user_id = ?`;
    try {
      const [result] = await pool.execute(sql, [hashedPassword, userId]);
      return result.affectedRows;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },

  updateUserAvatar: async (userId, avatarUrl) => {
    const sql = `UPDATE Users SET avatar_url = ? WHERE user_id = ?`;
    try {
      const [result] = await pool.execute(sql, [avatarUrl, userId]);
      return result.affectedRows;
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    const sql = `SELECT user_id, username, email,password_hash, role, is_active, created_at, avatar_url
               FROM Users WHERE user_id = ?`;
    try {
      const [rows] = await pool.execute(sql, [userId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error in getUserById model:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    const sql = "DELETE FROM Users WHERE user_id = ?";
    try {
      const [result] = await pool.execute(sql, [userId]);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in deleteUser model:", error);
      throw error;
    }
  },
};

module.exports = User;
