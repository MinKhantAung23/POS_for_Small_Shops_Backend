const asyncHandler = require("express-async-handler");
const { PurchaseItem, Product, PurchaseOrder, Supplier } = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

// get all purchase items
const getAllPurchaseItems = asyncHandler(async (req, res, next) => {
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
        { "$product.name$": { [Op.like]: `%${search}%` } },
        { "$purchaseOrder.supplier.name$": { [Op.like]: `%${search}%` } },
        {
          "$purchaseOrder.supplier.contact_person$": {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    };
    const { count, rows: purchaseItems } = await PurchaseItem.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order_by]],
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: Product,
          as: "product",
        },
        {
          model: PurchaseOrder,
          as: "purchaseOrder",
          attributes: [
            "id",
            "status",
            "total_amount",
            "order_date",
            "received_date",
          ],
          include: [
            {
              model: Supplier,
              as: "supplier",
              attributes: ["id", "name", "contact_person", "phone", "address"],
            },
          ],
        },
      ],
    });
    if (!purchaseItems || purchaseItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Purchase items not found",
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
      message: "Purchase items retrieved successfully",
      data: purchaseItems,
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

// get purchase items by order id
const getPurchaseItemsByOrderId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const items = await PurchaseItem.findAll({
    where: { purchase_order_id: id },
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "sku", "price", "image_url"],
      },
    ],
  });

  return res.status(200).json({
    success: true,
    message: "Purchase items retrieved successfully",
    data: items,
  });
});

// update purchase item
const updatePurchaseItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, cost_price } = req.body;
  try {
    const item = await PurchaseItem.findByPk(id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase item not found" });
    }

    await item.update({
      quantity,
      cost_price,
      total_price: quantity * cost_price,
    });
    return res.status(200).json({
      success: true,
      message: "Purchase item updated",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

// delete purchase item
const deletePurchaseItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await PurchaseItem.findByPk(id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase item not found" });
    }

    await item.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Purchase item deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

module.exports = {
  getAllPurchaseItems,
  getPurchaseItemsByOrderId,
  updatePurchaseItem,
  deletePurchaseItem,
};
