const logger = require("../config/logger");
const Supplier = require("../models/supplier.model");
const ApiError = require("../utils/apiError");

const createSupplier = async (req, res, next) => {
  const { name, contact_person, phone, email, address } = req.body;

  try {
    const result = await Supplier.createSupplier(
      name,
      contact_person,
      phone,
      email,
      address
    );
    logger.info(`Supplier created successfully with ID: ${result.insertId}`);
    res.status(201).json({
      message: "Supplier created successfully!",
      supplierId: result.insertId,
    });
  } catch (error) {
    logger.error("Error creating supplier:", error);
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(
        409,
        "Supplier with this name or email already exists."
      );
    }
    next(error);
  }
};

const getAllSuppliers = async (req, res, next) => {
  try {
    const result = await Supplier.getAllSuppliers({
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
      sortBy: req.query.sortBy || "name",
      sortOrder: req.query.sortOrder || "asc",
      search: req.query.search || "",
    });
    const { suppliers, pagination } = result;

    //  No records found
    if (pagination.totalCount === 0) {
      return res.status(200).json({
        message: "No suppliers found for the given filters.",
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

    logger.info(`${suppliers.length} suppliers retrieved successfully!`);
    res.json({
      message: `${suppliers.length} suppliers retrieved successfully!`,
      data: suppliers,
      pagination: pagination,
    });
  } catch (error) {
    logger.error("Error fetching all suppliers:", error);
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  const supplierId = req.params.id;
  try {
    const supplier = await Supplier.getSupplierById(supplierId);
    if (!supplier) {
      throw new ApiError(404, "Supplier not found.");
    }
    logger.info(`Supplier with ID ${supplierId} retrieved successfully!`);
    res.json(supplier);
  } catch (error) {
    logger.error(`Error fetching supplier with ID ${supplierId}:`, error);
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  const supplierId = req.params.id;
  const updatedData = req.body;

  try {
    const affectedRows = await Supplier.updateSupplier(supplierId, updatedData);
    if (affectedRows === 0) {
      throw new ApiError(404, "Supplier not found or no changes were made.");
    }
    logger.info(`Supplier with ID ${supplierId} updated successfully!`);
    res.json({ message: "Supplier updated successfully!" });
  } catch (error) {
    logger.error(`Error updating supplier with ID ${supplierId}:`, error);
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(
        409,
        "Update failed: A supplier with this name or email already exists."
      );
    }
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  const supplierId = req.params.id;
  try {
    const affectedRows = await Supplier.deleteSupplier(supplierId);

    if (affectedRows === 0) {
      throw new ApiError(404, "Supplier not found.");
    }
    // res.status(204).send();
    logger.info(`Supplier with ID ${supplierId} deleted successfully.`);
    res.status(200).json({ message: "Supplier deleted successfully!" }); // 204 No Content for successful deletion
  } catch (error) {
    logger.error(`Error deleting supplier with ID ${supplierId}:`, error);
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new ApiError(
        409,
        "Cannot delete supplier: It is linked to existing products."
      );
    }
    next(error);
  }
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
