const StockAdjustment = require("../models/stockAdjustment.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/apiError");
const logger = require("../config/logger");

const ALLOWED_ADJUSTMENT_TYPES = [
  "Addition",
  "Removal",
  "Damage",
  "Return to Stock",
  "Inventory Correction - Increase",
  "Inventory Correction - Decrease",
  "Theft",
];

const createStockAdjustment = async (req, res, next) => {
  const { product_id, quantity_change, adjustment_type, reason } = req.body;
  const adjusted_by_user_id = req.user.id ?? null;
  if (!adjusted_by_user_id) {
    throw new ApiError(401, "Unauthorized user.");
  }
  try {
    const productExists = await Product.getProductById(product_id);
    if (!productExists) {
      throw new ApiError(404, `Product with ID ${product_id} not found.`);
    }

    const result = await StockAdjustment.createStockAdjustment(
      product_id,
      quantity_change,
      adjustment_type,
      reason,
      adjusted_by_user_id
    );

    logger.info("Stock adjustment created successfully!");
    res.status(201).json({
      message: "Stock adjustment created successfully!",
      adjustmentId: result.adjustmentId,
      productId: product_id,
      newQuantityChange: quantity_change,
    });
  } catch (error) {
    logger.error("Error creating stock adjustment:", error);
    if (error.message.includes("Product with ID")) {
      throw new ApiError(404, error.message);
    }

    if (
      error.code === "ER_NO_REFERENCED_ROW_2" ||
      error.code === "ER_NO_REFERENCED_ROW"
    ) {
      throw new ApiError(
        400,
        "Invalid user ID provided for 'adjusted_by_user'."
      );
    }
    next(error);
  }
};

const getAllStockAdjustments = async (req, res, next) => {
  try {
    const result = await StockAdjustment.getAllStockAdjustments({
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
      search: req.query.search || "",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
      sortBy: req.query.sortBy || "sa.adjustment_date",
      sortOrder: req.query.sortOrder || "desc",
    });

    const { adjustments, pagination } = result;

    //  No records found
    if (pagination.totalCount === 0) {
      return res.status(200).json({
        message: "No stock adjustments found for the given filters.",
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

    logger.info(
      `${adjustments.length} stock adjustments retrieved successfully!`
    );
    res.json({
      message: `${adjustments.length} stock adjustments retrieved successfully!`,
      data: adjustments,
      pagination: pagination,
    });
  } catch (error) {
    logger.error("Error fetching stock adjustments:", error);
    next(error);
  }
};

const getStockAdjustmentById = async (req, res, next) => {
  const adjustmentId = req.params.id;
  try {
    const adjustment = await StockAdjustment.getStockAdjustmentById(
      adjustmentId
    );
    if (!adjustment) {
      throw new ApiError(404, "Stock adjustment not found.");
    }

    logger.info(
      `Stock adjustment with ID ${adjustmentId} retrieved successfully.`
    );
    res.json({
      message: "Stock adjustment retrieved successfully!",
      data: adjustment,
    });
  } catch (error) {
    logger.error(
      `Error fetching stock adjustment with ID ${adjustmentId}:`,
      error
    );
    next(error);
  }
};

module.exports = {
  createStockAdjustment,
  getAllStockAdjustments,
  getStockAdjustmentById,
};
