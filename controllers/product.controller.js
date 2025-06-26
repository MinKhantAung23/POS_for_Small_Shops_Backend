const logger = require("../config/logger");
const Product = require("../models/product.model");
const ApiError = require("../utils/apiError");

const createProduct = async (req, res, next) => {
  const {
    name,
    description,
    sku,
    barcode,
    price,
    cost_price,
    stock_quantity,
    category_id,
    supplier_id,
    reorder_point,
    image_url,
    is_active,
  } = req.body;

  try {
    const productData = {
      name,
      description,
      sku,
      barcode,
      price,
      cost_price,
      stock_quantity,
      category_id,
      supplier_id,
      reorder_point,
      image_url,
      is_active: is_active !== undefined ? is_active : true,
    };
    const result = await Product.createProduct(productData);
    logger.info(`Product created successfully with ID: ${result.insertId}`);
    res.status(201).json({
      message: "Product created successfully!",
      productId: result.insertId,
    });
  } catch (error) {
    logger.error("Error creating product:", error);
    if (error.code === "ER_DUP_ENTRY") {
      let field = error.message.includes("sku")
        ? "SKU"
        : error.message.includes("barcode")
        ? "Barcode"
        : "entry";
      // return res
      //   .status(409)
      //   .json({ message: `Product with this ${field} already exists.` });
      throw new ApiError(409, `Product with this ${field} already exists.`);
    }
    if (
      error.code === "ER_NO_REFERENCED_ROW_2" ||
      error.code === "ER_NO_REFERENCED_ROW"
    ) {
      // return res.status(400).json({
      //   message:
      //     "Invalid category_id or supplier_id provided. They must exist in Categories or Suppliers table.",
      // });
      throw new ApiError(
        400,
        "Invalid category_id or supplier_id provided. They must exist in Categories or Suppliers table."
      );
    }
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    // Parse and validate pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    //  Parse filters
    const search = req.query.search || "";
    const category = req.query.category || "";
    const supplier = req.query.supplier || "";
    const filterName = req.query.name || "";
    const createdAt = req.query.created_at || "";
    const updatedAt = req.query.updated_at || "";

    // Parse sorting
    const sortBy = req.query.sortBy || "p.name";
    const sortOrder =
      (req.query.sortOrder || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";

    //  Call model with parameters
    const result = await Product.getAllProducts({
      page,
      limit,
      search,
      category,
      supplier,
      sortBy,
      sortOrder,
      filterName,
      createdAt,
      updatedAt,
    });

    const { products, pagination } = result;

    //  No records found
    if (pagination.totalCount === 0) {
      return res.status(200).json({
        message: "No products found for the given filters.",
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
    logger.info(`Retrieved ${products.products.length} products.`);
    // Send response
    res.json({
      message: `${products.length} products retrieved successfully!`,
      data: products,
      pagination: pagination,
    });
  } catch (error) {
    // res.status(500).json({ message: "Failed to retrieve products." });
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const product = await Product.getProductById(productId);
    if (!product) {
      logger.warn(`Product with ID ${productId} not found.`);
      // return res.status(404).json({ message: "Product not found." });
      throw new ApiError(404, "Product not found.");
    }
    logger.info(`Product with ID ${productId} retrieved.`);
    res.json({
      message: "Product retrieved successfully!",
      data: product,
    });
  } catch (error) {
    logger.error(`Error fetching product with ID ${productId}:`, error);
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const productId = req.params.id;
  const updatedData = req.body;

  try {
    const affectedRows = await Product.updateProduct(productId, updatedData);
    if (affectedRows === 0) {
      throw new ApiError(404, "Product not found or no changes were made.");
    }
    logger.info(`Product with ID ${productId} updated successfully.`);
    res.status(200).json({ message: "Product updated successfully!" });
  } catch (error) {
    logger.error(`Error updating product with ID ${productId}:`, error);
    if (error.code === "ER_DUP_ENTRY") {
      let field = error.message.includes("sku")
        ? "SKU"
        : error.message.includes("barcode")
        ? "Barcode"
        : "entry";
      throw new ApiError(
        409,
        `Update failed: Product with this ${field} already exists.`
      );
    }
    if (
      error.code === "ER_NO_REFERENCED_ROW_2" ||
      error.code === "ER_NO_REFERENCED_ROW"
    ) {
      throw new ApiError(
        400,
        "Invalid category_id or supplier_id provided. They must exist in Categories or Suppliers table."
      );
    }
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const affectedRows = await Product.deleteProduct(productId);
    if (affectedRows === 0) {
      throw new ApiError(404, "Product not found.");
    }
    logger.info(`Product with ID ${productId} deleted successfully.`);
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    logger.error(`Error deleting product with ID ${productId}:`, error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new ApiError(
        409,
        "Cannot delete product: it is linked to sales or stock adjustments."
      );
    }
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
