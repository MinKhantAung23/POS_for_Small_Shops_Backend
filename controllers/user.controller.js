const User = require("../models/user.model");
const Auth = require("../models/auth.model");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/apiError");
const logger = require("../config/logger");

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, is_active, avatar_url } = req.body;

    const existingUser = await Auth.findUserByEmail(email);
    if (existingUser) {
      throw new ApiError(400, "Email already exists");
      // return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.createUser(
      name,
      email,
      hashedPassword,
      role,
      is_active ?? 1,
      avatar_url ?? null
    );

    logger.info(`User created successfully with ID: ${result.insertId}`);
    res.status(201).json({ message: "User created!", userId: result.insertId });
  } catch (error) {
    logger.error("Error creating user:", error);
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const isActive = req.query.is_active ?? "";
    const sortBy = req.query.sortBy || "created_at";
    const sortOrder =
      (req.query.sortOrder || "desc").toLowerCase() === "desc" ? "DESC" : "ASC";

    const result = await User.getAllUsers({
      page,
      limit,
      search,
      role,
      isActive,
      sortBy,
      sortOrder,
    });

    const { users, pagination } = result;

    if (pagination.totalCount === 0) {
      return res.status(200).json({
        message: "No users found for the given filters.",
        data: [],
        pagination,
      });
    }

    if (pagination.totalPages > 0 && pagination.page > pagination.totalPages) {
      return res.status(400).json({
        message: `Page ${pagination.page} exceeds total pages (${pagination.totalPages}).`,
        data: [],
        pagination,
      });
    }

    logger.info(`${users.length} users retrieved successfully!`);
    res.json({
      message: `${users.length} users retrieved successfully.`,
      data: users,
      pagination,
    });
  } catch (error) {
    logger.error("Error fetching all users:", error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.getUserById(req.params.id);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }
    logger.info(`User with ID ${req.params.id} retrieved successfully.`);
    res.json({ message: "User retrieved successfully.", data: user });
  } catch (error) {
    logger.error("Error fetching user by ID:", error);
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const allowedFields = [
      "username",
      "email",
      "role",
      "is_active",
      "avatar_url",
    ];
    const updateData = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }
    const affectedRows = await User.updateUser(userId, updateData);
    if (affectedRows === 0) {
      throw new ApiError(404, "User not found or not updated.");
    }

    logger.info(`User with ID ${userId} updated successfully.`);
    res.json({ message: "User updated successfully." });
  } catch (error) {
    logger.error("Error updating user:", error);
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { current_password, new_password } = req.body;

    const user = await User.getUserById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      throw new ApiError(401, "Current password is incorrect.");
      // return res
      //   .status(401)
      //   .json({ message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    const updated = await User.updateUserPassword(userId, hashed);

    if (updated === 0) {
      return res.status(400).json({ message: "Failed to update password." });
    }

    logger.info(`Password for user with ID ${userId} changed successfully.`);
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    logger.error("Error changing password:", error);
    next(error);
  }
};

const changeAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { avatar_url } = req.body;

    if (!avatar_url) {
      throw new ApiError(400, "Avatar URL is required.");
    }

    const updated = await User.updateUserAvatar(userId, avatar_url);

    if (updated === 0) {
      throw new ApiError(404, "User not found or avatar not changed.");
    }

    logger.info(`Avatar for user with ID ${userId} updated successfully.`);
    res.json({ message: "Avatar updated successfully." });
  } catch (error) {
    logger.error("Error updating avatar:", error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const affectedRows = await User.deleteUser(req.params.id);
    if (affectedRows === 0) {
      throw new ApiError(404, "User not found.");
    }
    logger.info(`User with ID ${req.params.id} deleted successfully.`);
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    logger.error("Error deleting user:", error);
    next(error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  changeAvatar,
};
