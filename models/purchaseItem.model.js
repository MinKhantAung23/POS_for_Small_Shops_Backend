module.exports = (sequelize, DataTypes) => {
  const PurchaseItem = sequelize.define(
    "PurchaseItem",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      purchase_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cost_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: "purchase_items",
      timestamps: true,
      underscored: true,
    }
  );
  return PurchaseItem;
};
