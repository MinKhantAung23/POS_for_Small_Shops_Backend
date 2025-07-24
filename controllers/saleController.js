const asyncHandler = require("express-async-handler");
const {
  Sale,
  SaleItem,
  Product,
  Discount,
  User,
  Customer,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

const createNewSale = asyncHandler(async (req, res, next) => {
  let transaction;
  const { customer_id, user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User is required to start a sale.",
    });
  }
  try {
    transaction = await sequelize.transaction();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const salesTodayCount = await Sale.count({
      where: {
        order_date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      transaction: transaction,
    });
    const nextSequenceNumber = salesTodayCount + 1;
    const invoice_number = generateInvoiceNumber(nextSequenceNumber, "POS");

    const newSale = await Sale.create(
      {
        invoice_number: invoice_number,
        user_id: user_id,
        customer_id: customer_id || null,
        order_date: new Date(),
        status: "pending",
        subtotal: 0.0,
        total_discount_amount: 0.0,
        tax_amount: 0.0,
        final_total: 0.0,
      },
      { transaction: transaction }
    );

    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: "New sale started successfully",
      data: newSale,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

const addSaleItem = asyncHandler(async (req, res, next) => {
  const { sale_id, product_id, quantity, item_discount_amount = 0 } = req.body;
  if (!sale_id || !product_id || !quantity) {
    return res.status(400).json({
      success: false,
      message: "sale_id, product_id, and quantity are required.",
    });
  }
  const transaction = await sequelize.transaction();
  try {
    const sale = await Sale.findByPk(sale_id, { transaction });
    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Sale not found.",
      });
    }
    if (sale.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot add items to a sale with status '${sale.status}'. Only 'pending' sales can be modified.`,
      });
    }
    const product = await Product.findByPk(product_id, { transaction });
    if (!product || !product.is_active) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    if (product.stock < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}`,
      });
    }

    const unit_price = parseFloat(product.price);
    const itemTotal = unit_price * quantity - item_discount_amount;

    const newItem = await SaleItem.create(
      {
        sale_id,
        product_id,
        quantity,
        unit_price,
        item_discount_amount,
        item_total: itemTotal,
      },
      { transaction }
    );

    sale.subtotal += itemTotal;
    sale.final_total =
      sale.subtotal - sale.total_discount_amount + sale.tax_amount;

    await sale.save({ transaction });
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Item added to sale successfully.",
      data: newItem,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

const getAllSales = asyncHandler(async (req, res, next) => {
  try {
    const {
      search = "", // can be sale_number, customer name, etc.
      sort_by = "created_at",
      order_by = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { invoice_number: { [Op.like]: `%${search}%` } },
        { "$customer.name$": { [Op.like]: `%${search}%` } },
      ],
    };

    const { count, rows: sales } = await Sale.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order_by]],
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: User,
          as: "createdBy",
        },
      ],
    });

    if (!sales || sales.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sales not found",
        data: [],
        pagination: {
          total: 0,
          current_page: parseInt(page),
          limit: parseInt(limit),
          total_pages: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sales retrieved successfully",
      data: sales,
      pagination: {
        total: count,
        current_page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occurred: ${error.message}`,
    });
  }
});

const getSaleById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const sale = await Sale.findByPk(id, {
      include: [
        { model: Customer, as: "customer", attributes: ["id", "name"] },
        { model: User, as: "user", attributes: ["id", "name"] },
        {
          model: SaleItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "sku", "barcode"],
            },
          ],
        },
      ],
    });
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sale retrieved successfully",
      data: sale,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`,
    });
  }
});

const updateSaleItem = asyncHandler(async (req, res) => {
  const { saleId, itemId } = req.params;
  const { quantity, unit_price, item_discount_amount } = req.body;

  try {
    const item = await SaleItem.findOne({
      where: { id: itemId, sale_id: saleId },
    });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const item_total = unit_price * quantity - item_discount_amount;

    await item.update({
      quantity,
      unit_price,
      item_discount_amount,
      item_total,
    });

    const saleItems = await SaleItem.findAll({ where: { sale_id: saleId } });

    const subtotal = saleItems.reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0
    );
    const total_discount_amount = saleItems.reduce(
      (sum, i) => sum + i.item_discount_amount,
      0
    );
    const final_total = subtotal - total_discount_amount;

    await Sale.update(
      { subtotal, total_discount_amount, final_total },
      { where: { id: saleId } }
    );

    return res.json({
      success: true,
      message: "Sale item updated and totals recalculated",
      data: item,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const removeSaleItem = asyncHandler(async (req, res) => {
  const { saleId, itemId } = req.params;

  try {
    const item = await SaleItem.findOne({
      where: { id: itemId, sale_id: saleId },
    });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    await item.destroy();

    const saleItems = await SaleItem.findAll({ where: { sale_id: saleId } });

    const subtotal = saleItems.reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0
    );
    const total_discount_amount = saleItems.reduce(
      (sum, i) => sum + i.item_discount_amount,
      0
    );
    const final_total = subtotal - total_discount_amount;

    await Sale.update(
      { subtotal, total_discount_amount, final_total },
      { where: { id: saleId } }
    );

    return res.json({
      success: true,
      message: "Sale item deleted and totals recalculated",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const updateSaleItemQuantity = async (req, res) => {
  try {
    const { saleId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const saleItem = await SaleItem.findOne({
      where: { id: itemId, sale_id: saleId },
    });

    if (!saleItem) {
      return res.status(404).json({ message: "Sale item not found" });
    }

    const product = await Product.findByPk(saleItem.product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newTotal = (
      product.price * quantity -
      saleItem.item_discount_amount
    ).toFixed(2);

    await saleItem.update({
      quantity,
      item_total: newTotal,
    });

    res.status(200).json({ message: "Sale item updated", saleItem });
  } catch (error) {
    console.error("Error updating sale item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateSale = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { customer_id, status, items } = req.body;

  const sale = await Sale.findByPk(id, {
    include: [{ model: SaleItem, as: "items" }],
  });

  if (!sale) {
    return res.status(404).json({ success: false, message: "Sale not found" });
  }

  sale.customer_id = customer_id || sale.customer_id;
  sale.status = status || sale.status;

  const existingItemIds = sale.items.map((item) => item.id);
  const updatedItemIds = items.filter((i) => i.id).map((i) => i.id);

  const itemsToDelete = existingItemIds.filter(
    (id) => !updatedItemIds.includes(id)
  );
  await SaleItem.destroy({ where: { id: itemsToDelete } });

  let subtotal = 0;
  for (const item of items) {
    const itemTotal =
      item.unit_price * item.quantity - item.item_discount_amount;
    subtotal += itemTotal;

    if (item.id) {
      await SaleItem.update(
        {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_discount_amount: item.item_discount_amount,
          item_total: itemTotal,
        },
        { where: { id: item.id } }
      );
    } else {
      await SaleItem.create({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        item_discount_amount: item.item_discount_amount,
        item_total: itemTotal,
      });
    }
  }

  const total_discount = items.reduce(
    (sum, i) => sum + (i.item_discount_amount || 0),
    0
  );
  const final_total = subtotal;

  sale.subtotal = subtotal;
  sale.total_discount_amount = total_discount;
  sale.final_total = final_total;

  await sale.save();

  res.status(200).json({
    success: true,
    message: "Sale updated successfully",
    data: sale,
  });
});

const applyDiscountToSale = asyncHandler(async (req, res, next) => {
  const { saleId } = req.params;
  const { discountType, discountValue } = req.body;
  try {
    const sale = await Sale.findByPk(saleId);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const subtotal = parseFloat(sale.subtotal);
    let discountAmount = 0;

    if (discountType === "percentage") {
      if (discountValue < 0 || discountValue > 100)
        return res.status(400).json({ message: "Invalid percentage" });
      discountAmount = subtotal * (discountValue / 100);
    } else if (discountType === "amount") {
      if (discountValue < 0 || discountValue > subtotal)
        return res.status(400).json({ message: "Invalid discount amount" });
      discountAmount = discountValue;
    } else {
      return res.status(400).json({ message: "Invalid discount type" });
    }

    const finalTotal = subtotal - discountAmount + parseFloat(sale.tax_amount);

    await sale.update({
      total_discount_amount: discountAmount,
      final_total: finalTotal,
    });

    return res.json({
      message: "Discount applied successfully",
      sale,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const completeSale = asyncHandler(async (req, res, next) => {
  const { saleId, items, discountAmount = 0, taxRate = 0.05 } = req.body;

  if (!saleId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Sale ID and items are required." });
  }
  try {
    const sale = await Sale.findByPk(saleId);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found." });
    }

    let subtotal = 0;
    for (const item of items) {
      subtotal += parseFloat(item.price) * item.quantity;
    }

    const taxAmount = (subtotal - discountAmount) * taxRate;
    const finalTotal = subtotal - discountAmount + taxAmount;
    await sequelize.transaction(async (t) => {
      // Update sale
      await sale.update(
        {
          subtotal,
          total_discount_amount: discountAmount,
          tax_amount: taxAmount,
          final_total: finalTotal,
          status: "completed",
        },
        { transaction: t }
      );

      await SaleItem.destroy({ where: { sale_id: sale.id }, transaction: t });

      for (const item of items) {
        await SaleItem.create(
          {
            sale_id: sale.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          },
          { transaction: t }
        );
      }
    });

    return res.json({
      success: true,
      message: "Sale completed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const cancelSale = asyncHandler(async (req, res, next) => {
  try {
    const saleId = req.params.id;
    const sale = await Sale.findByPk(saleId, {
      include: [SaleItem],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.status === "cancelled") {
      return res.status(400).json({ message: "Sale already cancelled" });
    }
    if (sale.status === "completed") {
      for (const item of sale.SaleItems) {
        const product = await Product.findByPk(item.product_id);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    sale.status = "cancelled";
    await sale.save();

    return res.json({
      success: true,
      message: "Sale cancelled successfully",
      data: sale,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = {
  createNewSale,
  addSaleItem,
  getAllSales,
  getSaleById,
  updateSaleItem,
  removeSaleItem,
  updateSale,
  updateSaleItemQuantity,
  applyDiscountToSale,
  completeSale,
  cancelSale,
};
