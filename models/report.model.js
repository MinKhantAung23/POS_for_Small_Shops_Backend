// models/report.model.js
const pool = require("../config/db");

const Report = {
  getSalesSummary: async (startDate, endDate) => {
    const sql = `
      SELECT
          DATE(s.sale_date) AS sale_day,
          SUM(si.quantity * si.unit_price) AS total_revenue,
          SUM(si.quantity * (si.unit_price - si.cost_price_at_sale)) AS total_profit,
          COUNT(DISTINCT s.sale_id) AS total_transactions,
          SUM(si.quantity) AS total_items_sold
      FROM Sales s
      JOIN SaleItems si ON s.sale_id = si.sale_id
      WHERE DATE(s.sale_date) BETWEEN ? AND ?
      GROUP BY sale_day
      ORDER BY sale_day ASC;
    `;
    try {
      const [rows] = await pool.execute(sql, [startDate, endDate]);
      return rows;
    } catch (error) {
      console.error("Error getting sales summary:", error);
      throw error;
    }
  },

  getProductSalesPerformance: async (
    startDate,
    endDate,
    limit = parseInt(limit, 10) || 10,
    orderBy = "total_quantity_sold",
    orderDirection = "DESC"
  ) => {
    const allowedOrderBy = [
      "total_quantity_sold",
      "total_revenue",
      "total_profit",
    ];
    const finalOrderBy = allowedOrderBy.includes(orderBy)
      ? orderBy
      : "total_quantity_sold";
    const finalOrderDirection =
      orderDirection?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const sql = `
      SELECT
          p.product_id,
          p.name AS product_name,
          p.sku,
          c.name AS category_name,
          SUM(si.quantity) AS total_quantity_sold,
          SUM(si.quantity * si.unit_price) AS total_revenue,
          SUM(si.quantity * (si.unit_price - p.cost_price)) AS total_profit
      FROM Products p
      JOIN SaleItems si ON p.product_id = si.product_id
      JOIN Sales s ON si.sale_id = s.sale_id
      LEFT JOIN Categories c ON p.category_id = c.category_id
      WHERE DATE(s.sale_date) BETWEEN ${startDate} AND ${endDate}
      GROUP BY p.product_id, p.name, p.sku, c.name
      ORDER BY ${finalOrderBy} ${finalOrderDirection}
      LIMIT ?;
    `;
    try {
      const [rows] = await pool.execute(sql, [startDate, endDate, limit]);
      return rows;
    } catch (error) {
      console.error("Error getting product sales performance:", error);
      throw error;
    }
  },

  getLowStockProducts: async () => {
    const sql = `
      SELECT
          p.product_id,
          p.name,
          p.sku,
          p.stock_quantity,
          p.reorder_point,
          c.name AS category_name,
          s.name AS supplier_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.category_id
      LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
      WHERE p.stock_quantity <= p.reorder_point AND p.is_active = 1
      ORDER BY p.stock_quantity ASC;
    `;
    try {
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (error) {
      console.error("Error getting low stock products:", error);
      throw error;
    }
  },
};

module.exports = Report;
