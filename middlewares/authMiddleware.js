const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User, Role } = require("../models");
require("dotenv").config();

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
        include: [{ model: Role, as: "role", attributes: ["name"] }],
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized, User not found",
        });
      }

      next();
    } catch (error) {
      console.error("Authentication Error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Unauthorized, Invalid token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, No token provided",
    });
  }
});

module.exports = authMiddleware;
