const db = require("../config/db");

const StockAdjustment = {
  createStockAdjustment: async (
    product_id,
    quantity_change,
    adjustment_type,
    reason,
    adjusted_by_user_id
  ) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      const insertSql = `
        INSERT INTO StockAdjustments (
          product_id, quantity_change, adjustment_type, reason,
          adjusted_by_user_id, adjustment_date
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const [adjustmentResult] = await connection.execute(insertSql, [
        product_id,
        quantity_change,
        adjustment_type,
        reason,
        adjusted_by_user_id,
      ]);
      const adjustmentId = adjustmentResult.insertId;

      const updateProductSql = `
        UPDATE Products
        SET stock_quantity = stock_quantity + ?
        WHERE product_id = ?
      `;
      const [productUpdateResult] = await connection.execute(updateProductSql, [
        quantity_change,
        product_id,
      ]);

      if (productUpdateResult.affectedRows === 0) {
        throw new Error(
          `Product with ID ${product_id} not found for stock update.`
        );
      }

      await connection.commit();
      return { adjustmentId };
    } catch (error) {
      if (connection) {
        await connection.rollback();
        console.error(
          "Stock adjustment transaction rolled back due to error:",
          error.message
        );
      }
      console.error("Error in createStockAdjustment model:", error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  getAllStockAdjustments: async ({
    page = 1,
    limit = 10,
    search = "",
    startDate = "",
    endDate = "",
    sortBy = "sa.adjustment_date",
    sortOrder = "DESC",
  }) => {
    const offset = (page - 1) * limit;

    const allowedSortFields = [
      "sa.adjustment_date",
      "sa.adjustment_type",
      "sa.quantity_change",
      "p.name",
      "u.username",
    ];

    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "sa.adjustment_date";
    const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const conditions = [];
    const values = [];

    const addCondition = (condition, ...params) => {
      conditions.push(condition);
      values.push(...params);
    };

    // Search product or user name
    if (search) {
      addCondition(
        `(p.name LIKE ? OR u.username LIKE ?)`,
        `%${search}%`,
        `%${search}%`
      );
    }

    //  Filter by date
    if (startDate) {
      addCondition(`DATE(sa.adjustment_date) >= ?`, startDate);
    }

    if (endDate) {
      addCondition(`DATE(sa.adjustment_date) <= ?`, endDate);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // Count query
    const countSql = `
    SELECT COUNT(*) AS total
    FROM StockAdjustments sa
    JOIN Products p ON sa.product_id = p.product_id
    JOIN Users u ON sa.adjusted_by_user_id = u.user_id
    ${whereClause}
  `;

    // Main query
    const sql = `
    SELECT
      sa.adjustment_id,
      sa.adjustment_date,
      sa.adjustment_type,
      sa.quantity_change,
      sa.reason,
      p.product_id,
      p.name AS product_name,
      u.username AS adjusted_by_user_name
    FROM StockAdjustments sa
    JOIN Products p ON sa.product_id = p.product_id
    JOIN Users u ON sa.adjusted_by_user_id = u.user_id
    ${whereClause}
    ORDER BY ${finalSortBy} ${finalSortOrder}
    LIMIT ? OFFSET ?
  `;
    try {
      const [[countResult]] = await db.query(countSql, values);
      const totalCount = countResult.total;
      const totalPages = Math.ceil(totalCount / limit);

      const [adjustments] = await db.query(sql, [...values, limit, offset]);
      return {
        adjustments,
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
      console.error("Error in getAllStockAdjustments model:", error);
      throw error;
    }
  },

  getStockAdjustmentById: async (id) => {
    const sql = `
      SELECT
        sa.adjustment_id,
        sa.adjustment_date,
        sa.adjustment_type,
        sa.quantity_change,
        sa.reason,
        p.product_id,
        p.name AS product_name,
        p.sku AS product_sku,
        p.stock_quantity AS current_product_stock, -- Current stock *after* this adjustment
        u.username AS adjusted_by_user_name
      FROM StockAdjustments sa
      JOIN Products p ON sa.product_id = p.product_id
      JOIN Users u ON sa.adjusted_by_user_id = u.user_id
      WHERE sa.adjustment_id = ?
    `;
    try {
      const [rows] = await db.execute(sql, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in getStockAdjustmentById model:", error);
      throw error;
    }
  },

  // TODO: Implement update and delete if needed, but carefully consider stock reversal logic.
  // For now, create and read are sufficient for basic inventory management.
};

module.exports = StockAdjustment;
