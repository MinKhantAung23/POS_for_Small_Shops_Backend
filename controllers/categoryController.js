const asyncHandler = require("express-async-handler");
const { Category } = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

// create category
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }
    const category = await Category.create({ name, description });
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// get all categories
const getAllCategories = asyncHandler(async (req, res, next) => {
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
      [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    };

    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order_by]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categories not found",
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
      message: "Categories retrieved successfully",
      data: categories,
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

// get category by id
const getCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        messsage: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// update category
const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    await category.update({ name, description });
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// delete category
const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    await category.destroy({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
