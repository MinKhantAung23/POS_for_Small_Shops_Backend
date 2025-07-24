const express = require("express");
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsBySaleId,
} = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "cashier"),
  createPayment
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getAllPayments
);
router.get(
  "/sale/:saleId",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getPaymentsBySaleId
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getPaymentById
);

module.exports = router;
