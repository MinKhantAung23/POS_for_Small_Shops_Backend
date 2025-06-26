const Joi = require("joi");

// Schema for creating a new category
const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).allow(null, ""), // Optional description
  is_active: Joi.boolean().default(true), // Default to true if not provided
});

// Schema for updating an existing category
const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(500).allow(null, ""),
  is_active: Joi.boolean(),
}).min(1); // At least one field must be provided for an update

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
