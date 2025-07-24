const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");

require("dotenv").config();

const getSalesSummaryReport = asyncHandler(async (req, res, next) => {
  try {
    let { start_date, end_date } = req.query;

    let startDateObj;
    let endDateObj;
    let reportPeriodLabel = "Sales Summary Report";

    if (start_date && end_date) {
      startDateObj = new Date(start_date);

      endDateObj = new Date(end_date);
      endDateObj.setDate(endDateObj.getDate() + 1);
      reportPeriodLabel = `Sales Summary from ${start_date} to ${end_date}`;
    } else {
      startDateObj = new Date();
      startDateObj.setHours(0, 0, 0, 0);

      endDateObj = new Date(startDateObj);
      endDateObj.setDate(endDateObj.getDate() + 1);
      reportPeriodLabel = `Daily Sales Summary for ${startDateObj.toLocaleDateString()}`;
    }

    const whereConditionSale = {
      sale_date: {
        [Op.gte]: startDateObj,
        [Op.lt]: endDateObj,
      },
      status: "completed",
    };

    const whereConditionPayment = {
      payment_date: {
        [Op.gte]: startDateObj,
        [Op.lt]: endDateObj,
      },
    };

    const salesSummary = await Sale.findOne({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "total_sales_count"],
        [sequelize.fn("SUM", sequelize.col("subtotal")), "total_subtotal"],
        [
          sequelize.fn("SUM", sequelize.col("total_discount_amount")),
          "total_discount_amount",
        ],
        [sequelize.fn("SUM", sequelize.col("tax_amount")), "total_tax_amount"],
        [
          sequelize.fn("SUM", sequelize.col("final_total")),
          "total_final_total",
        ],
      ],
      where: whereConditionSale,
      raw: true,
    });
    salesSummary.total_sales_count = parseInt(
      salesSummary.total_sales_count || 0
    );
    salesSummary.total_subtotal = parseFloat(
      salesSummary.total_subtotal || 0
    ).toFixed(2);
    salesSummary.total_discount_amount = parseFloat(
      salesSummary.total_discount_amount || 0
    ).toFixed(2);
    salesSummary.total_tax_amount = parseFloat(
      salesSummary.total_tax_amount || 0
    ).toFixed(2);
    salesSummary.total_final_total = parseFloat(
      salesSummary.total_final_total || 0
    ).toFixed(2);

    const paymentSummary = await Payment.findOne({
      attributes: [
        [
          sequelize.fn("SUM", sequelize.col("amount_paid")),
          "total_amount_paid",
        ],
        [
          sequelize.fn("SUM", sequelize.col("change_given")),
          "total_change_given",
        ],
      ],
      where: whereConditionPayment,
      raw: true,
    });

    paymentSummary.total_amount_paid = parseFloat(
      paymentSummary.total_amount_paid || 0
    ).toFixed(2);
    paymentSummary.total_change_given = parseFloat(
      paymentSummary.total_change_given || 0
    ).toFixed(2);

    const salesByPaymentMethod = await Payment.findAll({
      attributes: [
        "payment_method",
        [
          sequelize.fn("SUM", sequelize.col("amount_paid")),
          "total_paid_by_method",
        ],
        [
          sequelize.fn("COUNT", sequelize.col("id")),
          "transaction_count_by_method",
        ],
      ],
      where: whereConditionPayment,
      group: ["payment_method"],
      raw: true,
    });

    const formattedPaymentsByMethod = salesByPaymentMethod.map((method) => ({
      payment_method: method.payment_method,
      total_paid_by_method: parseFloat(
        method.total_paid_by_method || 0
      ).toFixed(2),
      transaction_count_by_method: parseInt(
        method.transaction_count_by_method || 0
      ),
    }));

    return res.status(200).json({
      success: true,
      message: reportPeriodLabel,
      data: {
        start_date: startDateObj.toISOString().split("T")[0],
        end_date: new Date(endDateObj.setDate(endDateObj.getDate() - 1))
          .toISOString()
          .split("T")[0],
        overall_sales: salesSummary,
        payment_totals: paymentSummary,
        sales_by_payment_method: formattedPaymentsByMethod,
      },
    });
  } catch (error) {
    console.error("Error generating sales summary report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while generating report.",
      error: error.message,
    });
  }
});

const getTopLeastSellingProducts = asyncHandler(async (req, res, next) => {
  try {
    let {
      start_date,
      end_date,
      limit = 10,
      order_by = "quantity",
      sort = "desc",
    } = req.query;

    limit = parseInt(limit);
    if (isNaN(limit) || limit <= 0) limit = 10;

    if (!["quantity", "revenue"].includes(order_by)) order_by = "quantity";
    if (!["asc", "desc"].includes(sort)) sort = "desc";

    let startDateObj;
    let endDateObj;

    if (start_date && end_date) {
      startDateObj = new Date(start_date);
      endDateObj = new Date(end_date);
      endDateObj.setDate(endDateObj.getDate() + 1); // Adjust to include the entire end_date
    } else {
      // Default to all time if no dates are provided
      // No specific date filter by default, unless you want a default period
    }

    const saleWhereCondition = {
      status: "completed", // Only consider products from completed sales
    };

    if (startDateObj && endDateObj) {
      saleWhereCondition.sale_date = {
        [Op.gte]: startDateObj,
        [Op.lt]: endDateObj,
      };
    }

    // Aggregate sale items based on product
    const topProducts = await SaleItem.findAll({
      attributes: [
        "product_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_quantity_sold"],
        [
          sequelize.fn("SUM", sequelize.col("item_total")),
          "total_revenue_generated",
        ], // Use item_total for accurate revenue
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["name", "sku", "price"], // Include product details
        },
        {
          model: Sale,
          as: "sale",
          attributes: [], // Don't fetch sale attributes, just use it for where condition
          where: saleWhereCondition,
          required: true, // INNER JOIN to ensure only completed sales are counted
        },
      ],
      group: ["SaleItem.product_id", "product.id"], // Group by product_id and include product attributes in group
      order: [
        [
          sequelize.literal(
            order_by === "quantity"
              ? "total_quantity_sold"
              : "total_revenue_generated"
          ),
          sort,
        ],
      ],
      limit: limit,
      raw: true, // Return plain data objects
    });

    // Format the output
    const formattedTopProducts = topProducts.map((p) => ({
      product_id: p.product_id,
      product_name: p["product.name"],
      product_sku: p["product.sku"],
      product_price: parseFloat(p["product.price"]).toFixed(2), // Original product price
      total_quantity_sold: parseInt(p.total_quantity_sold || 0),
      total_revenue_generated: parseFloat(
        p.total_revenue_generated || 0
      ).toFixed(2),
    }));

    const reportTitle =
      sort === "desc" ? "Top Selling Products" : "Least Selling Products";
    const periodLabel =
      startDateObj && endDateObj
        ? ` from ${startDateObj.toLocaleDateString()} to ${endDateObj.toLocaleDateString()}`
        : " (All Time)";

    return res.status(200).json({
      success: true,
      message: `${reportTitle}${periodLabel}`,
      data: formattedTopProducts,
    });
  } catch (error) {
    console.error("Error generating top/least selling products report:", error);
    return res.status(500).json({
      success: false,
      message:
        "Internal server error occurred while generating top/least selling products report.",
      error: error.message,
    });
  }
});

module.exports = {
  getSalesSummaryReport,
  getTopLeastSellingProducts,
};
