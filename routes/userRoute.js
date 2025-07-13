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
const router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.post("/change/password/:id", updatePassword);
router.post("/update/image/:id", updateImage);
router.delete("/:id", deleteUser);

module.exports = router;
