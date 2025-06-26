const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

router.get(
  "/sales/summary",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  reportController.getSalesSummaryReport
);

router.get(
  "/sales/product-performance",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  reportController.getProductSalesPerformanceReport
);
router.get(
  "/inventory/low-stock",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  reportController.getLowStockReport
);

module.exports = router;
