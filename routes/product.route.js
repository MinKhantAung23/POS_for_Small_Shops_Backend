const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { createProductSchema, updateProductSchema } = require("../validations/product.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(createProductSchema),
  productController.createProduct
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  productController.getAllProducts
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("Admin", "Manager", "Sales Associate"),
  productController.getProductById
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(updateProductSchema),
  productController.updateProduct
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  productController.deleteProduct
);

module.exports = router;
