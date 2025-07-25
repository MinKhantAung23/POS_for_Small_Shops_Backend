const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  createProduct
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getAllProducts
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getProductById
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateProduct
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  deleteProduct
);

module.exports = router;
