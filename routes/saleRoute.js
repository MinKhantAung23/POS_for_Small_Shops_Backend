const express = require("express");
const {
  createNewSale,
  getSaleById,
  addSaleItem,
  updateSale,
  updateSaleItem,
  removeSaleItem,
  getAllSales,
  applyDiscountToSale,
  completeSale,
  cancelSale,
} = require("../controllers/saleController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  createNewSale
);
router.post(
  "/:saleId/items",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  addSaleItem
);
router.post(
  "/sales/complete",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  completeSale
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  getAllSales
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  getSaleById
);
router.put(
  "/:saleId/items/:itemId",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  updateSaleItem
);
router.put(
  "/:saleId/apply-discount",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  applyDiscountToSale
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  updateSale
);
router.put("/:id/cancel", authMiddleware, authorizeRoles("admin"), cancelSale);
router.delete(
  "/:saleId/items/:itemId",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  removeSaleItem
);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), removeSaleItem);

module.exports = router;
