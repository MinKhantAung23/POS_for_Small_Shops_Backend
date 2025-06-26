const logger = require("../config/logger");
const Category = require("../models/category.model");
const ApiError = require("../utils/apiError");

const createCategory = async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const result = await Category.createCategory(name, description);
    logger.info(`Category created successfully with ID: ${result.insertId}`);
    res.status(201).json({
      message: "Category created successfully!",
      categoryId: result.insertId,
    });
  } catch (error) {
    logger.error("Error creating category:", error);
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, `Category with this ${field} already exists.`);
    }
    // res.status(500).json({ message: "Failed to create category." });
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || "name";
    const sortOrder =
      (req.query.sortOrder || "asc").toLowerCase() === "desc" ? "desc" : "asc";
    const search = req.query.search || "";
    const result = await Category.getAllCategories({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    });

    const { categories, pagination } = result;

    //  No records found
    if (pagination.totalCount === 0) {
      return res.status(200).json({
        message: "No categories found for the given filters",
        data: [],
        pagination: {
          ...pagination,
          sortBy,
          sortOrder,
        },
      });
    }

    //  Requested page exceeds total pages
    if (pagination.totalPages > 0 && pagination.page > pagination.totalPages) {
      return res.status(400).json({
        message: `Page ${pagination.page} exceeds total pages (${pagination.totalPages}).`,
        data: [],
        pagination: {
          ...pagination,
          sortBy,
          sortOrder,
        },
      });
    }

    logger.info(
      `${result.categories.length} categories retrieved successfully.`
    );
    res.json({
      message: `${result.categories.length} categories retrieved successfully!`,
      data: categories,
      pagination: {
        ...pagination,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    logger.error("Error fetching categories:", error);
    // res.status(500).json({ message: "Failed to retrieve categories." });
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(404, "Category not found.");
    }
    logger.info(`Category with ID ${categoryId} retrieved successfully.`);
    res.json(category);
  } catch (error) {
    logger.error(`Error fetching category with ID ${categoryId}:`, error);
    // res.status(500).json({ message: "Failed to retrieve category." });
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  const categoryId = req.params.id;
  const { name, description } = req.body;

  try {
    const affectedRows = await Category.updateCategory(categoryId, {
      name,
      description,
    });
    if (affectedRows === 0) {
      throw new ApiError(404, "Category not found or no changes were made.");
    }
    logger.info(`Category with ID ${categoryId} updated successfully.`);
    res.json({ message: "Category updated successfully!" });
  } catch (error) {
    logger.error(`Error updating category with ID ${categoryId}:`, error);

    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Update failed: Category name already exists.");
    }
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  const categoryId = req.params.id;
  try {
    const affectedRows = await Category.deleteCategory(categoryId);
    if (affectedRows === 0) {
      throw new ApiError(404, "Category not found.");
    }
    logger.info(`Category with ID ${categoryId} deleted successfully.`);
    res.status(204).json({ message: "Category deleted successfully!" }); // 204 No Content for successful deletion
  } catch (error) {
    logger.error(`Error deleting category with ID ${categoryId}:`, error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new ApiError(
        409,
        "Cannot delete category: It is linked to existing products."
      );
    }
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
