const express = require("express");
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  updateImage,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("admin"), createUser);
router.get("/", authMiddleware, authorizeRoles("admin"), getAllUsers);
router.get("/:id", authMiddleware, authorizeRoles("admin"), getUserById);
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateUser);
router.post(
  "/change/password/:id",
  authMiddleware,
  authorizeRoles("admin"),
  updatePassword
);
router.post(
  "/update/image/:id",
  authMiddleware,
  authorizeRoles("admin"),
  updateImage
);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteUser);

module.exports = router;
