const pool = require("../config/db");

const Sale = {
  createSaleWithItems: async (saleData, items) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction(); // Start the transaction

      // 1. Create the Sale entry
      const saleSql = `
        INSERT INTO Sales (
          user_id, customer_id, sale_date, payment_method,
          sub_total, discount_amount, tax_amount, total_amount,
          amount_paid, change_given
        ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
      `;
      const [saleResult] = await connection.execute(saleSql, [
        saleData.user_id,
        saleData.customer_id,
        saleData.payment_method,
        saleData.sub_total,
        saleData.discount_amount,
        saleData.tax_amount,
        saleData.total_amount,
        saleData.amount_paid,
        saleData.change_given,
      ]);
      const saleId = saleResult.insertId;

      // 2. Iterate through items to create SaleItems and update Product stock
      for (const item of items) {
        const {
          product_id,
          quantity,
          unit_price,
          item_total,
          discount_applied,
          cost_price_at_sale,
        } = item;

        // Fetch current product stock (even though checked in controller, safer to re-check in transaction)
        const [productRows] = await connection.execute(
          "SELECT stock_quantity FROM Products WHERE product_id = ? FOR UPDATE", // FOR UPDATE locks the row
          [product_id]
        );

        if (productRows.length === 0) {
          throw new Error(
            `Product with ID ${product_id} not found during sale processing.`
          );
        }
        const currentStock = productRows[0].stock_quantity;

        if (currentStock < quantity) {
          throw new Error(
            `Insufficient stock for product ID ${product_id}. Available: ${currentStock}, Requested: ${quantity}`
          );
        }

        // Create SaleItem entry
        const saleItemSql = `
          INSERT INTO SaleItems (sale_id, product_id, quantity, unit_price, item_total, discount_applied, cost_price_at_sale)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(saleItemSql, [
          saleId,
          product_id,
          quantity,
          unit_price,
          item_total,
          discount_applied,
          cost_price_at_sale,
        ]);

        // Update Product stock quantity
        const updateStockSql = `
          UPDATE Products
          SET stock_quantity = stock_quantity - ?
          WHERE product_id = ?
        `;
        await connection.execute(updateStockSql, [quantity, product_id]);
      }

      await connection.commit(); // Commit the transaction if all operations succeed
      return { saleId }; // Return the ID of the created sale
    } catch (error) {
      if (connection) {
        await connection.rollback(); // Rollback the transaction if any error occurs
        console.error(
          "Sale transaction rolled back due to error:",
          error.message
        );
      }
      console.error("Error in createSaleWithItems model:", error);
      throw error; // Re-throw the error for the controller to handle
    } finally {
      if (connection) {
        connection.release(); // Always release the connection back to the pool
      }
    }
  },

  getAllSales: async ({
    page = 1,
    limit = 10,
    search = "",
    startDate = "",
    endDate = "",
    sortBy = "s.sale_date",
    sortOrder = "DESC",
  }) => {
    const offset = (page - 1) * limit;

    // Safe sort fields
    const allowedSortFields = [
      "s.sale_date",
      "s.total_amount",
      "s.amount_paid",
      "c.customer_name",
      "u.username",
    ];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "s.sale_date";
    const finalSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // WHERE conditions and values
    const conditions = [];
    const values = [];

    const addCondition = (condition, ...params) => {
      conditions.push(condition);
      values.push(...params);
    };

    if (search) {
      addCondition(
        `(c.customer_name LIKE ? OR u.username LIKE ?)`,
        `%${search}%`,
        `%${search}%`
      );
    }

    if (startDate) {
      addCondition(`DATE(s.sale_date) >= ?`, startDate);
    }

    if (endDate) {
      addCondition(`DATE(s.sale_date) <= ?`, endDate);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // Count total sales (before pagination)
    const countSql = `
    SELECT COUNT(DISTINCT s.sale_id) AS total
    FROM Sales s
    JOIN Users u ON s.user_id = u.user_id
    LEFT JOIN Customers c ON s.customer_id = c.customer_id
    LEFT JOIN SaleItems si ON s.sale_id = si.sale_id
    ${whereClause}
  `;

    // Main sales query
    const salesSql = `
    SELECT
      s.sale_id,
      s.sale_date,
      s.sub_total,
      s.discount_amount,
      s.tax_amount,
      s.total_amount,
      s.payment_method,
      s.amount_paid,
      s.change_given,
      u.username AS user_name,
      c.customer_name,
      COUNT(si.sale_item_id) AS total_items_sold
    FROM Sales s
    JOIN Users u ON s.user_id = u.user_id
    LEFT JOIN Customers c ON s.customer_id = c.customer_id
    LEFT JOIN SaleItems si ON s.sale_id = si.sale_id
    ${whereClause}
    GROUP BY s.sale_id
    ORDER BY ${finalSortBy} ${finalSortOrder}
    LIMIT ? OFFSET ?
  `;

    try {
      const [[countResult]] = await pool.query(countSql, values);
      const totalCount = countResult.total;
      const totalPages = Math.ceil(totalCount / limit);

      const [sales] = await pool.query(salesSql, [...values, limit, offset]);

      return {
        sales,
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
      console.error("Error in getAllSales model:", error);
      throw error;
    }
  },

  getSaleById: async (saleId) => {
    // First, get the main sale details
    const saleSql = `
      SELECT
        s.sale_id,
        s.sale_date,
        s.sub_total,
        s.discount_amount,
        s.tax_amount,
        s.total_amount,
        s.payment_method,
        s.amount_paid,
        s.change_given,
        u.username AS user_name,
        c.customer_name
      FROM Sales s
      JOIN Users u ON s.user_id = u.user_id
      LEFT JOIN Customers c ON s.customer_id = c.customer_id
      WHERE s.sale_id = ?
    `;

    // Then, get the items for that sale
    const itemsSql = `
      SELECT
        si.sale_item_id,
        si.product_id,
        p.name AS product_name,
        p.sku,
        p.image_url,
        si.quantity,
        si.unit_price,
        si.item_total,
        si.discount_applied
      FROM SaleItems si
      JOIN Products p ON si.product_id = p.product_id
      WHERE si.sale_id = ?
      ORDER BY p.name ASC
    `;

    try {
      const [saleRows] = await pool.execute(saleSql, [saleId]);
      if (saleRows.length === 0) {
        return null;
      }
      const sale = saleRows[0];

      const [itemRows] = await pool.execute(itemsSql, [saleId]);
      sale.items = itemRows;

      return sale;
    } catch (error) {
      console.error("Error in getSaleById model:", error);
      throw error;
    }
  },

  updateSale: async (saleId, updatedData) => {
    const fields = [];
    const values = [];

    // Dynamically build the SET clause for allowed updatable fields
    if (updatedData.customer_id !== undefined) {
      fields.push("customer_id = ?");
      values.push(updatedData.customer_id);
    }
    if (updatedData.payment_method !== undefined) {
      fields.push("payment_method = ?");
      values.push(updatedData.payment_method);
    }
    if (updatedData.amount_paid !== undefined) {
      fields.push("amount_paid = ?");
      values.push(updatedData.amount_paid);
    }
    if (updatedData.discount_amount !== undefined) {
      fields.push("discount_amount = ?");
      values.push(updatedData.discount_amount);
    }

    // Re-calculate derived fields if a critical input field changes (e.g., if total_amount changes)
    // This part is tricky if you want to allow complex updates; often simpler to create new sale for changes.
    // For now, assume if you're updating 'amount_paid' or 'discount_amount', that's what's intended.
    // If you need to recalculate total_amount, sub_total etc. you'd need the original items data.

    if (fields.length === 0) {
      return 0; // No fields to update
    }

    const sql = `UPDATE Sales SET ${fields.join(", ")} WHERE sale_id = ?`;
    values.push(saleId);

    try {
      const [result] = await pool.execute(sql, values);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in updateSale model:", error);
      throw error;
    }
  },

  deleteSale: async (saleId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(`DELETE FROM SaleItems WHERE sale_id = ?`, [
        saleId,
      ]);
      const [result] = await connection.execute(
        `DELETE FROM Sales WHERE sale_id = ?`,
        [saleId]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error("Error in deleteSale model:", error);
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = Sale;
