const Joi = require("joi");

const adjustmentTypes = [
  "Addition",
  "Removal",
  "Damage",
  "Return to Stock",
  "Inventory Correction - Increase",
  "Inventory Correction - Decrease",
  "Theft",
];

// Schema for creating a new stock adjustment
const createStockAdjustmentSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  adjustment_type: Joi.string()
    .valid(...adjustmentTypes)
    .required(), // Must be one of the defined types
  quantity_change: Joi.number().integer().min(1).required(), // Always positive as it's an absolute adjustment
  reason: Joi.string().trim().max(500).allow("").optional(),
  // adjustment_date: Joi.date()
  //   .iso()
  //   .default(() => new Date()), // ISO 8601 date string, defaults to current date
});

// Schema for updating an existing stock adjustment (less common, usually new ones are created)
// Most fields would be immutable, but if you allow edits, here's a schema.
const updateStockAdjustmentSchema = Joi.object({
  adjustment_type: Joi.string().valid(...adjustmentTypes),
  quantity_change: Joi.number().integer().min(1),
  reason: Joi.string().trim().max(500),
  adjustment_date: Joi.date().iso(),
}).min(1);

module.exports = {
  createStockAdjustmentSchema,
  updateStockAdjustmentSchema,
  adjustmentTypes,
};
