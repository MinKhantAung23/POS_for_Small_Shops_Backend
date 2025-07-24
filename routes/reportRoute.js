const express = require("express");
const {
  getSalesSummaryReport,
  getTopLeastSellingProducts,
} = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const router = express.Router();

router.get(
  "/sales-summary",
  authMiddleware,
  authorizeRoles("admin", "manager", "accountant"),
  getSalesSummaryReport
);
router.get(
  "/top-products",
  authMiddleware,
  authorizeRoles("admin", "manager", "accountant"),
  getTopLeastSellingProducts
);

module.exports = router;
