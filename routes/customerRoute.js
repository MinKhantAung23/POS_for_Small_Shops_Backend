const express = require("express");
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  createCustomer
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  getAllCustomers
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  getCustomerById
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  updateCustomer
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager", "cashier"),
  deleteCustomer
);

module.exports = router;
