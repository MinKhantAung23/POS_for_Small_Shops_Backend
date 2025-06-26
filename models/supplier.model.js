const pool = require("../config/db");

const Supplier = {
  createSupplier: async (
    name,
    contact_person = null,
    phone = null,
    email = null,
    address = null
  ) => {
    const sql =
      "INSERT INTO Suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)";
    try {
      const [result] = await pool.execute(sql, [
        name,
        contact_person,
        phone,
        email,
        address,
      ]);
      return result;
    } catch (error) {
      console.error("Error in createSupplier model:", error);
      throw error;
    }
  },

  getAllSuppliers: async ({
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    search = "",
  }) => {
    const offset = (page - 1) * limit;
    const allowedSortFields = ["name", "email", "supplier_id"];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "name";
    const finalSortOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

    //  WHERE conditions and values
    const conditions = [];
    const values = [];

    const addCondition = (condition, ...params) => {
      conditions.push(condition);
      values.push(...params);
    };

    //  Search by supplier name
    if (search) {
      addCondition(`name LIKE ?`, `%${search}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `
    SELECT COUNT(*) AS total
    FROM Suppliers
    ${whereClause}
  `;

    const suppliersSql = `
    SELECT name, email, phone, contact_person, address, supplier_id
    FROM Suppliers
    ${whereClause}
    ORDER BY ${finalSortBy} ${finalSortOrder}
    LIMIT ? OFFSET ?
  `;

    try {
      //  Get total count
      const [[countResult]] = await pool.query(countSql, values);
      const totalCount = countResult.total;
      const totalPages = Math.ceil(totalCount / limit);

      // Fetch suppliers
      const [suppliers] = await pool.query(suppliersSql, [
        ...values, // filter/search
        limit,
        offset,
      ]);

      //  Return result
      return {
        suppliers,
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
      console.error("Error in getAllSuppliers model:", error);
      throw error;
    }
  },

  getSupplierById: async (id) => {
    const sql = "SELECT * FROM Suppliers WHERE supplier_id = ?";
    try {
      const [rows] = await pool.execute(sql, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in getSupplierById model:", error);
      throw error;
    }
  },

  updateSupplier: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.contact_person !== undefined) {
      fields.push("contact_person = ?");
      values.push(data.contact_person);
    }
    if (data.phone !== undefined) {
      fields.push("phone = ?");
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email);
    }
    if (data.address !== undefined) {
      fields.push("address = ?");
      values.push(data.address);
    }

    if (fields.length === 0) {
      return 0;
    }

    const sql = `UPDATE Suppliers SET ${fields.join(
      ", "
    )} WHERE supplier_id = ?`;
    values.push(id);

    try {
      const [result] = await pool.execute(sql, values);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in updateSupplier model:", error);
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    const sql = "DELETE FROM Suppliers WHERE supplier_id = ?";
    try {
      const [result] = await pool.execute(sql, [id]);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in deleteSupplier model:", error);
      throw error;
    }
  },
};

module.exports = Supplier;
