const Joi = require("joi");

const createSaleItemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
});
//  Schema for creating a sale
const createSaleSchema = Joi.object({
  customer_id: Joi.number().integer().positive().allow(null),
  payment_method: Joi.string()
    .valid("Cash", "Card", "Credit", "Mobile Payment", "Other")
    .required(),

  discount_amount: Joi.number().precision(2).min(0).default(0),
  amount_paid: Joi.number().precision(2).min(0).optional(),
  items: Joi.array().items(createSaleItemSchema).min(1).required(),
});

//  Schema for updating a sale
const updateSaleSchema = Joi.object({
  customer_id: Joi.number().integer().positive().allow(null),
  payment_method: Joi.string().valid(
    "Cash",
    "Card",
    "Credit",
    "Mobile Payment",
    "Other"
  ),
  discount_amount: Joi.number().precision(2).min(0),
  amount_paid: Joi.number().precision(2).min(0),
  items: Joi.array().items(createSaleItemSchema).min(1),
}).min(1); // At least one field is required

module.exports = {
  createSaleSchema,
  updateSaleSchema,
  createSaleItemSchema,
};
