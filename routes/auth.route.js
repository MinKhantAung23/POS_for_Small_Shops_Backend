const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const validate = require("../middlewares/validation.middleware");
const { createUserSchema, loginUserSchema } = require("../validations/user.validation");

router.post("/register", validate(createUserSchema), register);
router.post("/login", validate(loginUserSchema), login);

module.exports = router;
