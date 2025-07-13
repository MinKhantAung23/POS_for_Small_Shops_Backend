module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    "customer",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      loyalty_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "customers",
      timestamps: true,
      underscored: true,
    }
  );
  return Customer;
};
