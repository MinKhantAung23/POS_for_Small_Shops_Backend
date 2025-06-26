const logger = require("../config/logger");
const Report = require("../models/report.model");
const ApiError = require("../utils/apiError");

const getSalesSummaryReport = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, "Start date and end date are required.");
  }

  // Basic date format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD.");
  }

  try {
    const summary = await Report.getSalesSummary(startDate, endDate);
    logger.info("Sales summary retrieved successfully!");
    res.status(200).json({
      message: "Sales summary retrieved successfully!",
      data: summary,
    });
  } catch (error) {
    logger.error("Error in getSalesSummaryReport:", error);
    next(error);
  }
};

const getProductSalesPerformanceReport = async (req, res, next) => {
  const { startDate, endDate, limit, orderBy, orderDirection } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, "Start date and end date are required.");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD.");
  }

  const parsedLimit = parseInt(limit, 10) || 10;
  const allowedOrderBy = [
    "total_quantity_sold",
    "total_revenue",
    "total_profit",
  ];

  const finalOrderBy = allowedOrderBy.includes(orderBy)
    ? orderBy
    : "total_quantity_sold";

  const finalOrderDirection =
    orderDirection?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  try {
    const performance = await Report.getProductSalesPerformance(
      startDate,
      endDate,
      parsedLimit,
      finalOrderBy,
      finalOrderDirection
    );
    logger.info("Product sales performance retrieved successfully!");
    res.status(200).json({
      message: "Product sales performance retrieved successfully!",
      data: performance,
    });
  } catch (error) {
    logger.error("Error in getProductSalesPerformanceReport:", error);
    next(error);
  }
};

const getLowStockReport = async (req, res, next) => {
  try {
    const lowStockProducts = await Report.getLowStockProducts();
    logger.info("Low stock products retrieved successfully!");
    res.status(200).json({
      message: "Low stock products retrieved successfully!",
      data: lowStockProducts,
    });
  } catch (error) {
    logger.error("Error in getLowStockReport:", error);
    next(error);
  }
};

module.exports = {
  getSalesSummaryReport,
  getProductSalesPerformanceReport,
  getLowStockReport,
};
