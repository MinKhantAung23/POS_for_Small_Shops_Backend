module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define(
    "supplier",
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
      contact_person: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "suppliers",
      timestamps: true,
      underscored: true,
    }
  );
  return Supplier;
};
