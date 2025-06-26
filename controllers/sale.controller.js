const Sale = require("../models/sale.model");
const Product = require("../models/product.model");
const {
  createSaleSchema,
  updateSaleSchema,
} = require("../validations/sale.validation");
const ApiError = require("../utils/apiError");
const logger = require("../config/logger");

// Define a sales tax rate (e.g., 7% sales tax)
const SALES_TAX_RATE = 0.07; // 7%

const createSale = async (req, res, next) => {
  const { customer_id, payment_method, items, discount_amount, amount_paid } =
    req.body;
  const user_id = req.user.id;

  // Validate user_id from token (should always be present for authenticated routes)
  if (!user_id) {
    throw new ApiError(401, "Authenticated user ID not found.");
  }

  let subTotal = 0;
  const processedItems = [];

  try {
    const allProducts = await Product.getAllProducts({});
    const productMap = new Map(
      allProducts.products.map((p) => [p.product_id, p])
    );

    for (const item of items) {
      const { product_id, quantity } = item;

      const product = productMap.get(product_id);

      if (!product) {
        throw new ApiError(400, `Product with ID ${product_id} not found.`);
      }
      if (!product.is_active) {
        throw new ApiError(
          400,
          `Product "${product.name}" (ID: ${product_id}) is inactive.`
        );
      }
      if (product.stock_quantity < quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.name}" (ID: ${product_id}). Available: ${product.stock_quantity}, Requested: ${quantity}.`
        );
      }

      // Use the current price and cost from the database for the sale item
      const unit_price = parseFloat(product.price);
      const cost_price = parseFloat(product.cost_price); // CRUCIAL for profit calculation
      const itemTotal = unit_price * quantity; // Item total before any individual item discounts
      const discountAppliedToItem = 0.0; // Assuming no per-item discount from client for now

      processedItems.push({
        product_id: product_id,
        quantity: quantity,
        unit_price: unit_price,
        item_total: parseFloat(itemTotal.toFixed(2)),
        discount_applied: parseFloat(discountAppliedToItem.toFixed(2)), // Individual item discount
        cost_price_at_sale: cost_price, // Store the cost price at the time of sale
      });

      subTotal += itemTotal; // Accumulate subTotal for the entire sale
    }

    const saleDiscountAmount = parseFloat(discount_amount);

    // Amount subject to tax (subtotal minus sale-level discount)
    const taxableAmount = subTotal - saleDiscountAmount;

    // Calculate tax amount
    const taxAmount = taxableAmount > 0 ? taxableAmount * SALES_TAX_RATE : 0;

    // Calculate final total amount for the sale
    const totalAmountIncludingTax = subTotal - saleDiscountAmount + taxAmount;

    // Determine actual amount paid by customer (from request or assume exact payment)
    const finalAmountPaid =
      amount_paid >= 0 ? parseFloat(amount_paid) : totalAmountIncludingTax;

    // Calculate change given to customer
    const changeGiven = finalAmountPaid - totalAmountIncludingTax;

    if (
      payment_method !== "Credit" &&
      finalAmountPaid < totalAmountIncludingTax
    ) {
      return res.status(400).json({
        message: `Amount paid (${finalAmountPaid.toFixed(
          2
        )}) is less than total amount due (${totalAmountIncludingTax.toFixed(
          2
        )}) for ${payment_method} payment.`,
      });
    }

    const saleData = {
      user_id: user_id,
      customer_id: customer_id || null,
      payment_method: payment_method,
      sub_total: parseFloat(subTotal.toFixed(2)),
      discount_amount: parseFloat(saleDiscountAmount.toFixed(2)),
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: parseFloat(totalAmountIncludingTax.toFixed(2)),
      amount_paid: parseFloat(finalAmountPaid.toFixed(2)),
      change_given: parseFloat(changeGiven.toFixed(2)),
    };

    const result = await Sale.createSaleWithItems(saleData, processedItems);

    logger.info("Sale created successfully!");
    res.status(201).json({
      message: "Sale created successfully!",
      saleId: result.saleId,
      ...saleData,
    });
  } catch (error) {
    logger.error("Error creating sale:", error);
    if (
      error.message.includes("Product with ID") ||
      error.message.includes("Insufficient stock")
    ) {
      throw new ApiError(400, error.message);
    }

    if (
      error.code === "ER_NO_REFERENCED_ROW_2" ||
      error.code === "ER_NO_REFERENCED_ROW"
    ) {
      throw new ApiError(
        400,
        "Invalid customer_id or user_id provided. They must exist in Customers or Users table."
      );
    }

    next(error);
  }
};

const getAllSales = async (req, res, next) => {
  try {
    const result = await Sale.getAllSales({
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
      search: req.query.search || "",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
      sortBy: req.query.sortBy || "s.sale_date",
      sortOrder: req.query.sortOrder || "DESC",
    });

    const { sales, pagination } = result;

    //  No records found
    if (pagination.totalCount === 0) {
      return res.status(200).json({
        message: "No sales found for the given filters.",
        data: [],
        pagination,
      });
    }

    //  Requested page exceeds total pages
    if (pagination.totalPages > 0 && pagination.page > pagination.totalPages) {
      return res.status(400).json({
        message: `Page ${pagination.page} exceeds total pages (${pagination.totalPages}).`,
        data: [],
        pagination,
      });
    }

    logger.info(`${sales.length} sales retrieved successfully!`);
    res.json({
      message: `${sales.length} sales retrieved successfully!`,
      data: sales,
      pagination: pagination,
    });
  } catch (error) {
    logger.error("Error fetching sales:", error);
    next(error);
  }
};

const getSaleById = async (req, res, next) => {
  const saleId = req.params.id;
  try {
    const sale = await Sale.getSaleById(saleId);
    if (!sale) {
      throw new ApiError(404, "Sale not found.");
    }
    logger.info("Sale retrieved successfully!");
    res.json({
      message: "Sale retrieved successfully!",
      data: sale,
    });
  } catch (error) {
    logger.error(`Error fetching sale with ID ${saleId}:`, error);
    next(error);
  }
};

const updateSale = async (req, res, next) => {
  const saleId = req.params.id;
  const updatedData = req.body;

  try {
    const affectedRows = await Sale.updateSale(saleId, updatedData);
    if (affectedRows === 0) {
      throw new ApiError(404, "Sale not found or no changes were made.");
    }
    logger.info(`Sale with ID ${saleId} updated successfully.`);
    res.status(200).json({ message: "Sale updated successfully!" });
  } catch (error) {
    logger.error(`Error updating sale with ID ${saleId}:`, error);
    next(error);
  }
};

const deleteSale = async (req, res, next) => {
  const saleId = req.params.id;
  try {
    const affectedRows = await Sale.deleteSale(saleId);
    if (affectedRows === 0) {
      throw new ApiError(404, "Sale not found.");
    }
    // IMPORTANT: This basic delete does NOT revert stock quantities.
    // For a real POS, you'd need a separate "return" or "void" process that handles stock reversal.
    logger.info(`Sale with ID ${saleId} deleted successfully.`);
    res.status(200).json({
      message: "Sale and its items deleted successfully (stock not reverted).",
    });
  } catch (error) {
    logger.error(`Error deleting sale with ID ${saleId}:`, error);
    // Foreign key constraint if you tried to delete a product that's still in a sale item (shouldn't happen here)
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new ApiError(
        409,
        "Cannot delete sale: It is linked to other records (e.g., returns)."
      );
    }
    next(error);
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
};
