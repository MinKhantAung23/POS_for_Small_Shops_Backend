const express = require("express");
const router = express.Router();
const stockAdjustment = require("../controllers/stockAdjustment.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createStockAdjustmentSchema,
  updateStockAdjustmentSchema,
} = require("../validations/stockAdjustment.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(createStockAdjustmentSchema),
  stockAdjustment.createStockAdjustment
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  stockAdjustment.getAllStockAdjustments
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  stockAdjustment.getStockAdjustmentById
);

module.exports = router;
