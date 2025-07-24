const asyncHandler = require("express-async-handler");
const { Discount, Category, Product } = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

const createDiscount = asyncHandler(async (req, res, next) => {
  const {
    name,
    discount_type,
    product_id,
    category_id,
    min_quantity,
    value,
    value_type,
    start_date,
    end_date,
    is_active,
  } = req.body;
  try {
    if (!name || !discount_type || !value || !value_type) {
      return res.status(400).json({
        success: false,
        message:
          "Name, discount_type, value, and value_type fields are required",
      });
    }
    const discount = await Discount.create({
      name,
      discount_type,
      product_id,
      category_id,
      min_quantity,
      value,
      value_type,
      start_date,
      end_date,
      is_active,
    });
    return res.status(201).json({
      success: true,
      message: "Discount created successfully",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

const getAllDiscounts = asyncHandler(async (req, res, next) => {
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
        { "$products.name$": { [Op.like]: `%${search}%` } },
      ],
    };

    const { count, rows: discounts } = await Discount.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order_by]],
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: Product,
          as: "products",
        },
        {
          model: Category,
          as: "categories",
        },
      ],
    });

    if (!discounts || discounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discounts not found",
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
      message: "Discounts retrieved successfully",
      data: discounts,
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

const getDiscountById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const discount = await Discount.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
        },
        {
          model: Category,
          as: "categories",
        },
      ],
    });
    if (!discount) {
      return res.status(404).json({ error: "Discount not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Discount retrieved successfully",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});
const updateDiscount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    discount_type,
    product_id,
    category_id,
    min_quantity,
    value,
    value_type,
    start_date,
    end_date,
    is_active,
  } = req.body;
  try {
    const discount = await Discount.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
        },
        {
          model: Category,
          as: "categories",
        },
      ],
    });
    if (!discount) {
      return res.status(404).json({ error: "Discount not found" });
    }
    await discount.update({
      name,
      discount_type,
      product_id,
      category_id,
      min_quantity,
      value,
      value_type,
      start_date,
      end_date,
      is_active,
    });

    return res.status(200).json({
      success: true,
      message: "Discount updated successfully",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

const deleteDiscount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }
    await discount.destroy({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Discount deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
};
