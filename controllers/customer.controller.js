const logger = require("../config/logger");
const Customer = require("../models/customer.model");
const ApiError = require("../utils/apiError");

const createCustomer = async (req, res, next) => {
  const {
    customer_name,
    phone,
    email,
    address,
    loyalty_points,
    profile_picture_url,
  } = req.body;

  try {
    const customerData = {
      customer_name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      loyalty_points: loyalty_points !== undefined ? loyalty_points : 0,
      profile_picture_url: profile_picture_url || null,
    };

    const result = await Customer.createCustomer(customerData);
    logger.info(`Customer created successfully with ID: ${result.insertId}`);
    res.status(201).json({
      message: "Customer created successfully!",
      customerId: result.insertId,
    });
  } catch (error) {
    logger.error("Error creating customer:", error);
    if (error.code === "ER_DUP_ENTRY") {
      let field = "";
      if (error.message.includes("phone")) field = "phone number";
      else if (error.message.includes("email")) field = "email";
      throw new ApiError(409, `Customer with this ${field} already exists.`);
    }
    next(error);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "customer_name";
    const sortOrder =
      (req.query.sortOrder || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const result = await Customer.getAllCustomers({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    });

    const { customers, pagination } = result;

    //  No records found
    if (pagination.totalCount === 0) {
      return res.status(200).json({
        message: "No customers found for the given filters",
        data: [],
        pagination,
      });
    }

    //  Requested page exceeds total pages
    if (pagination.totalPages > 0 && pagination.page > pagination.totalPages) {
      return res.status(400).json({
        message: `Page ${pagination.page} exceeds total pages (${pagination.totalPages}).`,
        data: [],
        pagination,
      });
    }

    logger.info(`Customers retrieved successfully!`);
    res.json({
      message: `${customers.length} customers retrieved successfully!`,
      data: customers,
      pagination: pagination,
    });
  } catch (error) {
    logger.error("Error fetching all customers:", error);

    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  const customerId = req.params.id;
  try {
    const customer = await Customer.getCustomerById(customerId);
    if (!customer) {
      throw new ApiError(404, "Customer not found.");
    }
    logger.info(`Customer with ID ${customerId} retrieved successfully.`);
    res.json({
      message: "Customer retrieved successfully!",
      data: customer,
    });
  } catch (error) {
    logger.error(`Error fetching customer with ID ${customerId}:`, error);
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  const customerId = req.params.id;
  const updatedData = req.body;

  try {
    const affectedRows = await Customer.updateCustomer(customerId, updatedData);
    if (affectedRows === 0) {
      throw new ApiError(404, "Customer not found or no changes were made.");
    }
    logger.info(`Customer with ID ${customerId} updated successfully.`);
    res.status(200).json({ message: "Customer updated successfully!" });
  } catch (error) {
    logger.error(`Error updating customer with ID ${customerId}:`, error);
    if (error.code === "ER_DUP_ENTRY") {
      let field = "";
      if (error.message.includes("phone")) field = "phone number";
      else if (error.message.includes("email")) field = "email";
      // return res.status(409).json({
      //   message: `Update failed: Customer with this ${field} already exists.`,
      // });
      throw new ApiError(
        409,
        `Update failed: Customer with this ${field} already exists.`
      );
    }
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  const customerId = req.params.id;
  try {
    const affectedRows = await Customer.deleteCustomer(customerId);
    if (affectedRows === 0) {
      throw new ApiError(404, "Customer not found.");
    }
    logger.info(`Customer with ID ${customerId} deleted successfully.`);
    res.status(200).json({ message: "Customer deleted successfully!" });
  } catch (error) {
    logger.error(`Error deleting customer with ID ${customerId}:`, error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new ApiError(
        409,
        "Cannot delete customer: This customer is linked to existing sales."
      );
    }
    next(error);
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
