const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db").sequelize;

const User = require("./user.model")(sequelize, DataTypes);
const Role = require("./role.model")(sequelize, DataTypes);
const Category = require("./category.model")(sequelize, DataTypes);
const Product = require("./product.model")(sequelize, DataTypes);
const Customer = require("./customer.model")(sequelize, DataTypes);
const Supplier = require("./supplier.model")(sequelize, DataTypes);

User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
User.hasMany(Product, { foreignKey: "created_by", as: "products" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(User, { foreignKey: "created_by", as: "createdBy" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

module.exports = {
  sequelize,
  User,
  Role,
  Category,
  Product,
  Customer,
  Supplier,
};
