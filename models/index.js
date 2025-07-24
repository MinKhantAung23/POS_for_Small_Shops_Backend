const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db").sequelize;

const User = require("./user.model")(sequelize, DataTypes);
const Role = require("./role.model")(sequelize, DataTypes);
const Category = require("./category.model")(sequelize, DataTypes);
const Product = require("./product.model")(sequelize, DataTypes);
const Customer = require("./customer.model")(sequelize, DataTypes);
const Supplier = require("./supplier.model")(sequelize, DataTypes);
const PurchaseOrder = require("./purchaseOrder.model")(sequelize, DataTypes);
const PurchaseItem = require("./purchaseItem.model")(sequelize, DataTypes);
const Discount = require("./discount.model")(sequelize, DataTypes);
const Sale = require("./sale.model")(sequelize, DataTypes);
const SaleItem = require("./saleItem.model")(sequelize, DataTypes);
const Payment = require("./payment.model")(sequelize, DataTypes);

User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
User.hasMany(Product, { foreignKey: "created_by", as: "products" });
User.hasMany(PurchaseOrder, { foreignKey: "user_id", as: "purchaseOrders" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(User, { foreignKey: "created_by", as: "createdBy" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

PurchaseOrder.hasMany(PurchaseItem, {
  foreignKey: "purchase_order_id",
  as: "items",
});
PurchaseOrder.belongsTo(User, { foreignKey: "user_id", as: "user" });
PurchaseOrder.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});

PurchaseItem.belongsTo(PurchaseOrder, {
  foreignKey: "purchase_order_id",
  as: "purchaseOrder",
});
PurchaseItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Discount.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
Product.hasMany(Discount, {
  foreignKey: "product_id",
  as: "discounts",
});

Discount.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});
Category.hasMany(Discount, {
  foreignKey: "category_id",
  as: "discounts",
});

Sale.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
Sale.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});
Sale.hasMany(SaleItem, {
  foreignKey: "sale_id",
  as: "items",
});

SaleItem.belongsTo(Sale, {
  foreignKey: "sale_id",
  as: "sale",
});
SaleItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Sale.hasMany(Payment, {
  foreignKey: "sale_id",
  as: "payments",
});

Payment.belongsTo(Sale, {
  foreignKey: "sale_id",
  as: "sale",
});

module.exports = {
  sequelize,
  User,
  Role,
  Category,
  Product,
  Customer,
  Supplier,
  PurchaseOrder,
  PurchaseItem,
  Discount,
  Sale,
  SaleItem,
  Payment,
};
