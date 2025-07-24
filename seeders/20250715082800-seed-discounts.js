"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("discounts", [
      // 1. Product Discount: 10% off on Product ID 1
      {
        name: "10% Off - Specific Product",
        discount_type: "product",
        product_id: 1,
        category_id: null,
        min_quantity: null,
        value: 10.0,
        value_type: "percentage",
        start_date: new Date("2025-07-15"),
        end_date: new Date("2025-08-15"),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // 2. Category Discount: 15,000 MMK off on Category ID 2
      {
        name: "15,000 MMK Off - Apparel",
        discount_type: "category",
        product_id: null,
        category_id: 2,
        min_quantity: null,
        value: 15000,
        value_type: "fixed",
        start_date: new Date("2025-07-20"),
        end_date: new Date("2025-08-01"),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // 3. Wholesale Discount: 20% if buy 5 or more of Product ID 3
      {
        name: "Buy 5+ Get 20% Off",
        discount_type: "wholesale",
        product_id: 3,
        category_id: null,
        min_quantity: 5,
        value: 20.0,
        value_type: "percentage",
        start_date: new Date("2025-07-10"),
        end_date: new Date("2025-12-31"),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // 4. Global Discount: Black Friday 15% off on all items
      {
        name: "Black Friday - 15% Off",
        discount_type: "global",
        product_id: null,
        category_id: null,
        min_quantity: null,
        value: 15.0,
        value_type: "percentage",
        start_date: new Date("2025-11-25"),
        end_date: new Date("2025-11-30"),
        is_active: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("discounts", null, {});
  },
};
