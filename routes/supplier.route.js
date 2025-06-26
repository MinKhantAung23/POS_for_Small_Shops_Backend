const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { createSupplierSchema, updateSupplierSchema } = require("../validations/supplier.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(createSupplierSchema),
  supplierController.createSupplier
);
router.get("/", verifyToken, supplierController.getAllSuppliers);
router.get("/:id", verifyToken, supplierController.getSupplierById);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(updateSupplierSchema),
  supplierController.updateSupplier
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  supplierController.deleteSupplier
);

module.exports = router;
