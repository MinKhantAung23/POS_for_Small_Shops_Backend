const express = require("express");
const {
  createCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
} = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  createCategory
);
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getAllCategories
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getCategoryById
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateCategory
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  deleteCategory
);

module.exports = router;
