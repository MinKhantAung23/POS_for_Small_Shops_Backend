module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sale_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM("cash", "card", "mobile_pay", "other"),
        allowNull: false,
        defaultValue: "cash",
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "payments",
      timestamps: true,
      underscored: true,
    }
  );
  return Payment;
};
