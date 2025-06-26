const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { createCustomerSchema, updateCustomerSchema } = require("../validations/customer.validation");

router.post(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(createCustomerSchema),
  customerController.createCustomer
);
router.get("/", verifyToken, customerController.getAllCustomers);
router.get("/:id", verifyToken, customerController.getCustomerById);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  validate(updateCustomerSchema),
  customerController.updateCustomer
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Admin"),
  customerController.deleteCustomer
);

module.exports = router;
