const express = require("express");
const router = express.Router();
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  purchaseOrderReceived,
  cancelPurchaseOrder,
} = require("../controllers/purchaseOrderController");
const {
  getPurchaseItemsByOrderId,
  getAllPurchaseItems,
  updatePurchaseItem,
  deletePurchaseItem,
} = require("../controllers/purchaseItemController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  createPurchaseOrder
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getAllPurchaseOrders
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getPurchaseOrderById
);
router.get(
  "/items",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getAllPurchaseItems
);
router.get(
  "/:id/items",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getPurchaseItemsByOrderId
);

router.post(
  "/:id/receive",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  purchaseOrderReceived
);
router.post(
  "/:id/cancel",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  cancelPurchaseOrder
);
router.post(
  "/update/item/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updatePurchaseItem
);
router.post(
  "/delete/item/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  deletePurchaseItem
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updatePurchaseOrder
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  deletePurchaseOrder
);

module.exports = router;
