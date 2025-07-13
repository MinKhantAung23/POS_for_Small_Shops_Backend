const asyncHandler = require("express-async-handler");
const { Supplier } = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

// create supplier
const createSupplier = asyncHandler(async (req, res, next) => {
  const { name, email, phone, address } = req.body;
  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    const supplier = await Supplier.create({ name, email, phone, address });
    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// get all suppliers
const getAllSuppliers = asyncHandler(async (req, res, next) => {
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
        { contact_person: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ],
    };
    const { count, rows: suppliers } = await Supplier.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order_by]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
    if (!suppliers || suppliers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Suppliers not found",
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
      message: "Suppliers retrieved successfully",
      data: suppliers,
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

// get supplier by id
const getSupplierById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Supplier retrieved successfully",
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// update supplier
const updateSupplier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  try {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    await supplier.update({ name, email, phone, address });
    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// delete supplier
const deleteSupplier = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    await supplier.destroy({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
