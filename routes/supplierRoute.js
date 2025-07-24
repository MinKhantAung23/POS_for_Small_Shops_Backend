const express = require("express");
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  createSupplier
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getAllSuppliers
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getSupplierById
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateSupplier
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  deleteSupplier
);

module.exports = router;
