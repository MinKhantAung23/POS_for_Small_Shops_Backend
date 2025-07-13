module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
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
      sku: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      barcode: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { isDecimal: true, min: 0.0 },
      },
      cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: { isDecimal: true, min: 0.0 },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        //   references: {
        //     model: "categories",
        //     key: "id",
        //   },
        //   onUpdate: "CASCADE",
        //   onDelete: "SET NULL",
      },
      created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        // references: {
        //   model: "users",
        //   key: "id",
        // },
        // onUpdate: "CASCADE",
        // onDelete: "SET NULL",
      },
    },
    {
      tableName: "products",
      timestamps: true,
      underscored: true,
    }
  );
  return Product;
};
