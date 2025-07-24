const express = require("express");
const {
  getAllDiscounts,
  deleteDiscount,
  createDiscount,
  updateDiscount,
  getDiscountById,
} = require("../controllers/discountController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("admin"), createDiscount);
router.get("/", authMiddleware, authorizeRoles("admin"), getAllDiscounts);
router.get("/:id", authMiddleware, authorizeRoles("admin"), getDiscountById);
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateDiscount);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteDiscount);

module.exports = router;
