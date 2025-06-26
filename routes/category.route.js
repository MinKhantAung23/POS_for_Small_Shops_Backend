const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validations/category.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(createCategorySchema),
  categoryController.createCategory
);
router.get("/", verifyToken, categoryController.getAllCategories);
router.get("/:id", verifyToken, categoryController.getCategoryById);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(updateCategorySchema),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  categoryController.deleteCategory
);

module.exports = router;
