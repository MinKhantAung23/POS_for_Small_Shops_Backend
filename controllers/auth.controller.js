const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../models/auth.model");
const ApiError = require("../utils/apiError");

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await Auth.findUserByEmail(email);
    if (existingUser) {
      // return res.status(400).json({ message: "Email already exists" });
      throw new ApiError(400, "Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Auth.createUser(
      name,
      email,
      hashedPassword,
      role || "Sales Associate"
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    // res.status(500).json({ message: "Server error" });
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Auth.findUserByEmail(email);
    if (!user) {
      // return res.status(404).json({ message: "User not found" });
      throw new ApiError(404, `User not found`);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // return res.status(401).json({ message: "Invalid credentials" });
      throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    // res.status(500).json({ message: "Server error" });
    next(error);
  }
};

module.exports = {
  register,
  login,
};
