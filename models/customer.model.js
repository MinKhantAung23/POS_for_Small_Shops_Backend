const db = require("../config/db");

const Customer = {
  createCustomer: async (customerData) => {
    const {
      customer_name,
      phone,
      email,
      address,
      loyalty_points,
      profile_picture_url,
    } = customerData;
    const sql = `
      INSERT INTO customers (customer_name, phone, email, address, loyalty_points, profile_picture_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await db.execute(sql, [
        customer_name,
        phone,
        email,
        address,
        loyalty_points || 0,
        profile_picture_url || null,
      ]);
      return result;
    } catch (error) {
      console.error("Error in createCustomer model:", error);
      throw error;
    }
  },

  getAllCustomers: async ({
    page = 1,
    limit = 10,
    sortBy = "customer_name",
    sortOrder = "asc",
    search = "",
  }) => {
    const offset = (page - 1) * limit;
    const allowedSortFields = [
      "customer_name",
      "email",
      "customer_id",
      "register_at",
    ];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "customer_name";
    const finalSortOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

    //  WHERE conditions and values
    const conditions = [];
    const values = [];

    const addCondition = (condition, ...params) => {
      conditions.push(condition);
      values.push(...params);
    };

    //  Search by customer name
    if (search) {
      addCondition(`customer_name LIKE ?`, `%${search}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `
    SELECT COUNT(*) AS total
    FROM Customers
    ${whereClause}
  `;

    const customersSql = `
    SELECT customer_id, customer_name, phone, email, address, loyalty_points, profile_picture_url, registered_at
    FROM Customers
    ${whereClause}
    ORDER BY ${finalSortBy} ${finalSortOrder}
    LIMIT ? OFFSET ?
  `;

    try {
      //  Get total count
      const [[countResult]] = await db.query(countSql, values);
      const totalCount = countResult.total;
      const totalPages = Math.ceil(totalCount / limit);

      // Fetch customers
      const [customers] = await db.query(customersSql, [
        ...values, // filter/search
        limit,
        offset,
      ]);

      //  Return result
      return {
        customers,
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
      console.error("Error in getAllCustomers model:", error);
      throw error;
    }
  },

  getCustomerById: async (id) => {
    const sql =
      "SELECT customer_id, customer_name, phone, email, address, loyalty_points, profile_picture_url, registered_at FROM Customers WHERE customer_id = ?";
    try {
      const [rows] = await db.execute(sql, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in getCustomerById model:", error);
      throw error;
    }
  },

  updateCustomer: async (id, updatedData) => {
    const fields = [];
    const values = [];

    if (updatedData.customer_name !== undefined) {
      fields.push("customer_name = ?");
      values.push(updatedData.customer_name);
    }
    if (updatedData.phone !== undefined) {
      fields.push("phone = ?");
      values.push(updatedData.phone);
    }
    if (updatedData.email !== undefined) {
      fields.push("email = ?");
      values.push(updatedData.email);
    }
    if (updatedData.address !== undefined) {
      fields.push("address = ?");
      values.push(updatedData.address);
    }
    if (updatedData.loyalty_points !== undefined) {
      fields.push("loyalty_points = ?");
      values.push(updatedData.loyalty_points);
    }
    if (updatedData.profile_picture_url !== undefined) {
      fields.push("profile_picture_url = ?");
      values.push(updatedData.profile_picture_url);
    }

    if (fields.length === 0) {
      return 0;
    }

    const sql = `UPDATE Customers SET ${fields.join(
      ", "
    )} WHERE customer_id = ?`;
    values.push(id);

    try {
      const [result] = await db.execute(sql, values);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in updateCustomer model:", error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    const sql = "DELETE FROM Customers WHERE customer_id = ?";
    try {
      const [result] = await db.execute(sql, [id]);
      return result.affectedRows;
    } catch (error) {
      console.error("Error in deleteCustomer model:", error);
      throw error;
    }
  },
};

module.exports = Customer;
