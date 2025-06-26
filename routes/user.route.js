const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {createUserSchema, updateUserSchema, changePasswordSchema } = require("../validations/user.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  validate(createUserSchema),
  userController.createUser
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  userController.getAllUsers
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  userController.getUserById
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  validate(updateUserSchema),
  userController.updateUser
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  userController.deleteUser
);
router.put(
  "/:id/change-password",
  verifyToken,
  authorizeRoles("Admin"),
  validate(changePasswordSchema),
  userController.changePassword
);
router.put(
  "/:id/change-avatar",
  verifyToken,
  authorizeRoles("Admin"),
  userController.changeAvatar
);

module.exports = router;
