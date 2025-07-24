const asyncHandler = require("express-async-handler");
const {
  PurchaseOrder,
  PurchaseItem,
  Product,
  Supplier,
  sequelize,
  User,
} = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

// create purchase order
const createPurchaseOrder = asyncHandler(async (req, res, next) => {
  const { supplier_id, order_date, notes, items } = req.body;
  const user_id = req.user?.id || 1;

  if (!supplier_id || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Supplier and items are required",
    });
  }

  const transaction = await sequelize.transaction();
  try {
    let total_amount = 0;
    items.forEach((item) => {
      total_amount += item.cost_price * item.quantity;
    });

    const purchaseOrder = await PurchaseOrder.create(
      {
        supplier_id,
        user_id,
        order_date: order_date || new Date(),
        notes,
        total_amount,
        status: "pending",
      },
      { transaction }
    );

    const purchaseItems = items.map((item) => ({
      purchase_order_id: purchaseOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      cost_price: item.cost_price,
      subtotal: item.cost_price * item.quantity,
    }));

    await PurchaseItem.bulkCreate(purchaseItems, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: purchaseOrder,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// get all purchase orders
const getAllPurchaseOrders = asyncHandler(async (req, res, next) => {
  try {
    const {
      search = "",
      sort_by = "created_at",
      order_by = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { "$supplier.name$": { [Op.like]: `%${search}%` } },
        { "$supplier.contact_person$": { [Op.like]: `%${search}%` } },
        { "$supplier.phone$": { [Op.like]: `%${search}%` } },
        { "$user.name$": { [Op.like]: `%${search}%` } },
        { "$user.email$": { [Op.like]: `%${search}%` } },
      ],
    };

    const { count, rows: purchaseOrders } = await PurchaseOrder.findAndCountAll(
      {
        where: whereClause,
        order: [[sort_by, order_by]],
        offset: parseInt(offset),
        limit: parseInt(limit),
        include: [
          { model: Supplier, as: "supplier" },
          {
            model: User,
            as: "user",
          },
        ],
      }
    );
    if (!purchaseOrders || purchaseOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Purchase orders not found",
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
      message: "Purchase orders retrieved successfully",
      data: purchaseOrders,
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
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// get purchase order by id
const getPurchaseOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await PurchaseOrder.findByPk(id, {
      include: [
        {
          model: PurchaseItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price", "stock"],
            },
          ],
        },
        {
          model: Supplier,
          as: "supplier",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase order retrieved",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// update purchase order
const updatePurchaseOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { supplier_id, user_id, order_date, status } = req.body;

  try {
    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase order not found" });
    }

    await order.update({ supplier_id, user_id, order_date, status });

    return res.status(200).json({
      success: true,
      message: "Purchase order updated",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// delete purchase order
const deletePurchaseOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase order not found" });
    }

    await order.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Purchase order deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

const purchaseOrderReceived = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await PurchaseOrder.findByPk(id, {
    include: {
      model: PurchaseItem,
      as: "items",
    },
  });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.status === "received") {
    return res
      .status(400)
      .json({ success: false, message: "Order already received" });
  }

  const transaction = await sequelize.transaction();
  try {
    for (const item of order.items) {
      const product = await Product.findByPk(item.product_id, { transaction });

      if (product) {
        await product.increment("stock", {
          by: item.quantity,
          transaction,
        });
      }
    }

    order.status = "received";
    order.received_date = new Date();
    await order.save({ transaction });

    await transaction.commit();

    return res
      .status(200)
      .json({ success: true, message: "Order received and stock updated" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

const cancelPurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const purchaseOrder = await PurchaseOrder.findByPk(id);

  if (!purchaseOrder) {
    return res.status(404).json({
      success: false,
      error: "Purchase order not found",
    });
  }

  if (purchaseOrder.status !== "pending") {
    return res.status(400).json({
      success: false,
      error: "Only pending orders can be cancelled",
    });
  }

  await purchaseOrder.update({ status: "cancelled" });

  return res.status(200).json({
    success: true,
    message: "Purchase order cancelled successfully",
    data: purchaseOrder,
  });
});

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  purchaseOrderReceived,
  cancelPurchaseOrder,
};
