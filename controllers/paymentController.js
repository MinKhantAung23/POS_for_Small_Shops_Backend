const asyncHandler = require("express-async-handler");
const { Payment, Sale } = require("../models");
const { Op } = require("sequelize");

require("dotenv").config();

const createPayment = asyncHandler(async (req, res, next) => {
  const { sale_id, amount, method } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const sale = await Sale.findByPk(sale_id, { transaction });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.status !== "completed") {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Sale must be completed before payment" });
    }

    const payments = await Payment.findAll({ where: { sale_id }, transaction });
    const totalPaid = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    if (totalPaid + parseFloat(amount) > parseFloat(sale.final_total)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Payment exceeds total amount" });
    }

    const payment = await Payment.create(
      { sale_id, method, amount },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      error: `Internal server error occured with error: ${error}`,
    });
  }
});

const getAllPayments = asyncHandler(async (req, res, next) => {
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
      [Op.or]: [{ "$sale.invoice_number$": { [Op.like]: `%${search}%` } }],
    };
    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      order: [[sort_by, order_by]],
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [{ model: Sale, as: "sale" }],
    });

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
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
      message: "Payments retrieved successfully",
      data: payments,
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

const getPaymentsBySaleId = asyncHandler(async (req, res, next) => {
  const { saleId } = req.params;
  try {
    const payments = await Payment.ffindAll({
    where: { sale_id: saleId },
    include: [{ model: Sale }]
  });

     if (!payments.length) {
    return res.status(404).json({ message: "No payments found for this sale" });
  }

    return res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`,
    });
  }
});

const getPaymentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const payment = await Payment.findByPk(id, {
      include: [{ model: Sale, as: "sale" }],
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`,
    });
  }
});

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsBySaleId,
  getPaymentById,
};
