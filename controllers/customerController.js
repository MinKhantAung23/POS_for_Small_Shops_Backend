const asyncHandler = require("express-async-handler");
const { Customer } = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

// create customer
const createCustomer = asyncHandler(async (req, res, next) => {
  const { name, email, phone, address, loyalty_points } = req.body;
  try {
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone fields are required",
      });
    }

    const existingCustomer = await Customer.findOne({ where: { phone } });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists",
      });
    }
    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      loyalty_points,
    });
    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// get all customers
const getAllCustomers = asyncHandler(async (req, res, next) => {
  try {
    const {
      search = "",
      sort_by = "created_at",
      order_by = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ],
    };
    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order_by]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customers not found",
        data: [],
        pagination: {
          total: 0,
          current_page: parseInt(page),
          limit: parseInt(limit),
          total_pages: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customers retrieved successfully",
      data: customers,
      pagination: {
        total: count,
        current_page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// get customer by id
const getCustomerById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Customer retrieved successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// update customer
const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, loyalty_points } = req.body;
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone fields are required",
      });
    }
    const existingCustomer = await Customer.findOne({ where: { phone } });
    if (existingCustomer && existingCustomer.id !== id) {
      return res.status(400).json({
        success: false,
        error: "Customer already exists",
      });
    }
    // customer.name = name;
    // customer.email = email;
    // customer.phone = phone;
    // customer.address = address;
    // customer.loyalty_points = loyalty_points;
    // await customer.save();

    await customer.update({
      name,
      email,
      phone,
      address,
      loyalty_points,
    });
    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// delete customer
const deleteCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    await customer.destroy({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
