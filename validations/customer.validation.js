// validations/customer.validation.js
const Joi = require("joi");

// Schema for creating a new customer
const createCustomerSchema = Joi.object({
  customer_name: Joi.string().trim().min(3).max(255).required(),
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required(), // Phone is typically required for customers
  email: Joi.string().trim().email().max(255).allow(null, ""), // Email optional
  address: Joi.string().trim().max(500).allow(null, ""), // Address optional
  loyalty_points: Joi.number().integer().min(0).default(0), // Default to 0 points
  profile_picture_url: Joi.string().uri().max(2048).allow(null, ""), // Validate as a URL
});

// Schema for updating an existing customer
const updateCustomerSchema = Joi.object({
  customer_name: Joi.string().trim().min(3).max(255),
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[0-9]{7,15}$/),
  email: Joi.string().trim().email().max(255).allow(null, ""),
  address: Joi.string().trim().max(500).allow(null, ""),
  loyalty_points: Joi.number().integer().min(0),
  profile_picture_url: Joi.string().uri().max(2048).allow(null, ""),
}).min(1); // At least one field must be provided for an update

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
