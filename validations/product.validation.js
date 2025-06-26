const Joi = require("joi");

// Schema for creating a new product
const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  description: Joi.string().trim().max(1000).allow(null, ""), // Allow null or empty string
  price: Joi.number().precision(2).positive().required(), // e.g., 99.99
  cost_price: Joi.number().precision(2).positive().allow(0).required(), // Must be positive or zero
  sku: Joi.string().trim().min(3).max(50).required(),
  barcode: Joi.string()
    .trim()
    .length(12)
    .pattern(/^[0-9]+$/)
    .allow(null, ""), // Example: 12-digit number
  stock_quantity: Joi.number().integer().min(0).required(),
  reorder_point: Joi.number().integer().min(0).required(),
  category_id: Joi.number().integer().positive().required(),
  supplier_id: Joi.number().integer().positive().required(),
  image_url: Joi.string().uri().max(2048).allow(null, ""), // Validate as a URL
  is_active: Joi.boolean().default(true), // Default value if not provided
});

// Schema for updating an existing product (all fields are optional, but if present, must be valid)
const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255),
  description: Joi.string().trim().max(1000).allow(null, ""),
  price: Joi.number().precision(2).positive(),
  cost_price: Joi.number().precision(2).positive().allow(0),
  sku: Joi.string().trim().min(3).max(50),
  barcode: Joi.string()
    .trim()
    .length(12)
    .pattern(/^[0-9]+$/)
    .allow(null, ""),
  stock_quantity: Joi.number().integer().min(0),
  reorder_point: Joi.number().integer().min(0),
  category_id: Joi.number().integer().positive(),
  supplier_id: Joi.number().integer().positive(),
  image_url: Joi.string().uri().max(2048).allow(null, ""),
  is_active: Joi.boolean(),
}).min(1); // At least one field must be provided for an update

module.exports = {
  createProductSchema,
  updateProductSchema,
};
