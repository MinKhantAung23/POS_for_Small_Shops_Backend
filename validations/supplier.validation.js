// validations/supplier.validation.js
const Joi = require("joi");

// Schema for creating a new supplier
const createSupplierSchema = Joi.object({
  name: Joi.string().trim().min(3).max(255).required(),
  contact_person: Joi.string().trim().max(100).allow(null, ""), // Optional
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[0-9]{7,15}$/)
    .allow(null, ""), // Basic phone number pattern (7-15 digits, optional +)
  email: Joi.string().trim().email().max(255).allow(null, ""), // Valid email format
  address: Joi.string().trim().max(500).allow(null, ""), // Optional address
});

// Schema for updating an existing supplier
const updateSupplierSchema = Joi.object({
  name: Joi.string().trim().min(3).max(255),
  contact_person: Joi.string().trim().max(100).allow(null, ""),
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[0-9]{7,15}$/)
    .allow(null, ""),
  email: Joi.string().trim().email().max(255).allow(null, ""),
  address: Joi.string().trim().max(500).allow(null, ""),
}).min(1); // At least one field must be provided for an update

module.exports = {
  createSupplierSchema,
  updateSupplierSchema,
};
