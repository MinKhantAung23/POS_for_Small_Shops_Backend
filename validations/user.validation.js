const Joi = require("joi");

// Define common password constraints (e.g., used for create and change password)
const passwordComplexity = Joi.string().min(8).max(50);
//   .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
//   .message('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');

// Schema for creating/registering a new user
const createUserSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().email().max(255).required(),
  password: passwordComplexity.required(), // Use passwordComplexity defined above
  role: Joi.string()
    .valid("Admin", "Manager", "Sales Associate", "Cashier", "Stock Manager")
    .default("Sales Associate"),
  is_active: Joi.number().default(1),
  avatar_url: Joi.string().uri().max(2048).allow(null, ""),
});

// Schema for updating an existing user (password not included here, change separately)
const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50),
  email: Joi.string().trim().email().max(255),
  role: Joi.string().valid(
    "Admin",
    "Manager",
    "Sales Associate",
    "Cashier",
    "Stock Manager"
  ),
  is_active: Joi.number(),
  avatar_url: Joi.string().uri().max(2048).allow(null, ""),
}).min(1); // At least one field must be provided for an update

// Schema for user login
const loginUserSchema = Joi.object({
  email: Joi.string().trim().email().max(255).required(),
  password: Joi.string().required(), // No complexity needed for login, just presence
});

// Schema for changing user password
const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: passwordComplexity.required(), // New password must meet complexity
  confirm_new_password: Joi.string()
    .valid(Joi.ref("new_password"))
    .required()
    .messages({
      "any.only": "New password and confirm new password do not match.",
    }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  loginUserSchema,
  changePasswordSchema,
};
