const pool = require("../config/db");

const Product = {
  createProduct: async (productData) => {
    const {
      name,
      description,
      sku,
      barcode,
      price,
      cost_price,
      stock_quantity,
      category_id,
      supplier_id,
      reorder_point,
      image_url,
      is_active,
    } = productData;

    const sql = `
      INSERT INTO Products (
        name, description, sku, barcode, price, cost_price,
        stock_quantity, category_id, supplier_id, reorder_point,
        image_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await pool.execute(sql, [
        name,
        description,
        sku,
        barcode,
        price,
        cost_price,
        stock_quantity,
        category_id,
        supplier_id,
        reorder_point,
        image_url,
        is_active,
      ]);
      return result;
    } catch (error) {
      console.error("Error in createProduct model:", error);
      throw error;
    }
  },

  getAllProducts: async ({
    page = 1,
    limit = 10,
    search = "",
    category = "",
    supplier = "",
    sortBy = "p.name",
    sortOrder = "ASC",
    filterName = "",
    createdAt = "",
    updatedAt = "",
  }) => {
    const offset = (page - 1) * limit;

    // Safe sort field validation
    const allowedSortFields = [
      "p.name",
      "p.price",
      "p.stock_quantity",
      "p.created_at",
      "p.updated_at",
    ];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "p.name";
    }

    // Build WHERE clause
    const conditions = [];
    const values = [];

    const addCondition = (condition, ...params) => {
      conditions.push(condition);
      values.push(...params);
    };

    if (search) {
      addCondition(
        `(p.name LIKE ? OR p.sku LIKE ?)`,
        `%${search}%`,
        `%${search}%`
      );
    }

    if (filterName) {
      addCondition(`p.name LIKE ?`, `%${filterName}%`);
    }

    if (category) {
      addCondition(`c.name = ?`, category);
    }

    if (supplier) {
      addCondition(`s.name = ?`, supplier);
    }

    if (createdAt) {
      addCondition(`DATE(p.created_at) = ?`, createdAt);
    }

    if (updatedAt) {
      addCondition(`DATE(p.updated_at) = ?`, updatedAt);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    //  Count query
    const countSql = `
    SELECT COUNT(*) AS total
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.category_id
    LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
    ${whereClause}
  `;

    // Main product query
    const productSql = `
    SELECT
      p.product_id, 
      p.name, 
      p.description, 
      p.sku, 
      p.barcode,
      p.price, 
      p.cost_price, 
      p.stock_quantity, 
      p.reorder_point,
      p.is_active, 
      p.image_url, 
      p.created_at, 
      p.updated_at,
      c.name AS category_name, 
      s.name AS supplier_name
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.category_id
    LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

    try {
      // Count query execution
      const [[countResult]] = await pool.query(countSql, values);
      const totalCount = countResult.total;
      const totalPages = Math.ceil(totalCount / limit);

      // Append pagination values to values list
      const [products] = await pool.query(productSql, [
        ...values,
        limit,
        offset,
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error in getAllProducts model:", error);
      throw error;
    }
  },

  getProductById: async (id) => {
    const sql = `
      SELECT
        p.product_id, 
        p.name, 
        p.description, 
        p.sku, 
        p.barcode,
        p.price, 
        p.cost_price, 
        p.stock_quantity, 
        p.reorder_point,
        p.is_active, 
        p.image_url, 
        p.created_at, 
        p.updated_at,
        c.name AS category_name, 
        s.name AS supplier_name
      FROM Products p
      JOIN Categories c ON p.category_id = c.category_id
      JOIN Suppliers s ON p.supplier_id = s.supplier_id
      WHERE p.product_id = ?
    `;
    try {
      const [rows] = await pool.execute(sql, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in getProductById model:", error);
      throw error;
    }
  },

  updateProduct: async (id, updatedData) => {
    const fields = [];
    const values = [];

    if (updatedData.name !== undefined) {
      fields.push("name = ?");
      values.push(updatedData.name);
    }
    if (updatedData.description !== undefined) {
      fields.push("description = ?");
      values.push(updatedData.description);
    }
    if (updatedData.sku !== undefined) {
      fields.push("sku = ?");
      values.push(updatedData.sku);
    }
    if (updatedData.barcode !== undefined) {
      fields.push("barcode = ?");
      values.push(updatedData.barcode);
    }
    if (updatedData.price !== undefined) {
      fields.push("price = ?");
      values.push(updatedData.price);
    }
    if (updatedData.cost_price !== undefined) {
      fields.push("cost_price = ?");
      values.push(updatedData.cost_price);
    }
    if (updatedData.stock_quantity !== undefined) {
      fields.push("stock_quantity = ?");
      values.push(updatedData.stock_quantity);
    }
    if (updatedData.category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(updatedData.category_id);
    }
    if (updatedData.supplier_id !== undefined) {
      fields.push("supplier_id = ?");
      values.push(updatedData.supplier_id);
    }
    if (updatedData.reorder_point !== undefined) {
      fields.push("reorder_point = ?");
      values.push(updatedData.reorder_point);
    }
    if (updatedData.is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(updatedData.is_active);
    }
    if (updatedData.image_url !== undefined) {
      fields.push("image_url = ?");
      values.push(updatedData.image_url);
    } // Added image_url

    if (fields.length === 0) {
      return 0;
    }

    const sql = `UPDATE Products SET ${fields.join(", ")} WHERE product_id = ?`;
    values.push(id);
    try {
      const [result] = await pool.execute(sql, values);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in updateProduct model:", error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    const sql = "DELETE FROM Products WHERE product_id = ?";
    try {
      const [result] = await pool.execute(sql, [id]);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in deleteProduct model:", error);
      throw error;
    }
  },
};

module.exports = Product;
