const asyncHandler = require("express-async-handler");
const { Product, Category, User } = require("../models");
const { nanoid } = require("nanoid");
const { Op } = require("sequelize");

require("dotenv").config();

const generateUniqueBarcode = async () => {
  let barcode;
  let exists = true;

  while (exists) {
    // Generate a unique barcode
    barcode = `PRD${nanoid(10).toUpperCase()}`;
    exists = await Product.findOne({ where: { barcode } });
  }

  return barcode;
};

// create product
const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    sku,
    description,
    price,
    cost_price,
    stock,
    image_url,
    is_active,
    category_id,
    created_by,
  } = req.body;
  try {
    if (!name || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and stock fields are required",
      });
    }
    const barcode = await generateUniqueBarcode();
    const product = await Product.create({
      name,
      sku,
      barcode,
      description,
      price,
      cost_price,
      stock,
      image_url,
      is_active,
      category_id,
      created_by,
    });
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// get all products
const getAllProducts = asyncHandler(async (req, res, next) => {
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
        { sku: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
      ],
    };

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order_by]],
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        { model: Category, as: "category" },
        {
          model: User,
          as: "createdBy",
        },
      ],
    });
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Products not found",
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
      message: "Products retrieved successfully",
      data: products,
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

// get product by id
const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
        },
        {
          model: User,
          as: "createdBy",
        },
      ],
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// update product
const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    sku,
    // barcode,
    description,
    price,
    cost_price,
    stock,
    image_url,
    is_active,
    category_id,
    created_by,
  } = req.body;
  try {
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        {
          model: User,
          as: "createdBy",
        },
      ],
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    await product.update({
      name,
      sku,
      // barcode,
      description,
      price,
      cost_price,
      stock,
      image_url,
      is_active,
      category_id,
      created_by,
    });
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// delete product
const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    await product.destroy({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
