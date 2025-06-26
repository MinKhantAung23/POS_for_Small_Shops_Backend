const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createSaleSchema,
  updateSaleSchema,
} = require("../validations/sale.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  validate(createSaleSchema),
  saleController.createSale
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  saleController.getAllSales
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  saleController.getSaleById
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  validate(updateSaleSchema),
  saleController.updateSale
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  saleController.deleteSale
);

module.exports = router;
