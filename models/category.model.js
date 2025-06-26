const db = require("../config/db");

const Category = {
  createCategory: async (name, description = null) => {
    const sql = "INSERT INTO categories (name, description) VALUES (?, ?)";
    try {
      const [result] = await db.execute(sql, [name, description]);
      return result;
    } catch (error) {
      console.error("Error in createCategory model:", error);
      throw error;
    }
  },

  getAllCategories: async ({
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    search = "",
  }) => {
    const offset = (page - 1) * limit;

    //  Whitelist allowed sort fields to avoid SQL injection
    const allowedSortFields = ["name", "category_id"];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "name";
    const finalSortOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

    //  WHERE conditions and values
    const conditions = [];
    const values = [];

    const addCondition = (condition, ...params) => {
      conditions.push(condition);
      values.push(...params);
    };

    //  Search by category name
    if (search) {
      addCondition(`name LIKE ?`, `%${search}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    //  Count total categories
    const countSql = `
    SELECT COUNT(*) AS total
    FROM Categories
    ${whereClause}
  `;

    //  Main query to fetch categories
    const categoriesSql = `
    SELECT category_id, name, description
    FROM Categories
    ${whereClause}
    ORDER BY ${finalSortBy} ${finalSortOrder}
    LIMIT ? OFFSET ?
  `;

    try {
      //  Get total count
      const [[countResult]] = await db.query(countSql, values);
      const totalCount = countResult.total;
      const totalPages = Math.ceil(totalCount / limit);

      // Fetch categories
      const [categories] = await db.query(categoriesSql, [
        ...values, // filter/search
        limit,
        offset,
      ]);

      // Return result
      return {
        categories,
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
      console.error("Error in getAllCategories model:", error);
      throw error;
    }
  },

  getCategoryById: async (id) => {
    const sql = "SELECT * FROM Categories WHERE category_id = ?";
    try {
      const [rows] = await db.execute(sql, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in getCategoryById model:", error);
      throw error;
    }
  },

  updateCategory: async (id, updatedCategory) => {
    const fields = [];
    const values = [];

    if (updatedCategory.name !== undefined) {
      fields.push("name = ?");
      values.push(updatedCategory.name);
    }
    if (updatedCategory.description !== undefined) {
      fields.push("description = ?");
      values.push(updatedCategory.description);
    }

    if (fields.length === 0) {
      return 0;
    }

    const sql = `UPDATE Categories SET ${fields.join(
      ", "
    )} WHERE category_id = ?`;
    values.push(id);

    try {
      const [result] = await db.execute(sql, values);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in updateCategory model:", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    const sql = "DELETE FROM Categories WHERE category_id = ?";
    try {
      const [result] = await db.execute(sql, [id]);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in deleteCategory model:", error);
      throw error;
    }
  },
};

module.exports = Category;
