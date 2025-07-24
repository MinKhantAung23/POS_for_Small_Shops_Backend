module.exports = (sequelize, DataTypes) => {
  const Discount = sequelize.define(
    "Discount",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discount_type: {
        type: DataTypes.ENUM("product", "category", "wholesale", "global"),
        allowNull: false,
        defaultValue: "product",
      },

      product_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      min_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Only for wholesale discount",
      },

      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "Discount amount or percentage value",
      },
      value_type: {
        type: DataTypes.ENUM("fixed", "percentage"),
        allowNull: false,
        defaultValue: "percentage",
      },

      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "discounts",
      timestamps: true,
      underscored: true,
    }
  );

  return Discount;
};
