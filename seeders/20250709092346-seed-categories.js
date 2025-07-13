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

    await queryInterface.bulkInsert(
      "categories",
      [
        {
          name: "Electronics",
          description: "Electronic gadgets and devices.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Apparel",
          description: "Clothing, footwear, and accessories.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Food and Beverage",
          description: "Food and beverage items.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Toys",
          description: "Fun and educational toys.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Home & Kitchen",
          description: "Items for home improvement and kitchen use.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Books",
          description: "Various genres of books.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Groceries",
          description: "Food and household supplies.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Health and Beauty",
          description: "Healthcare products and beauty products.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Sports and Fitness",
          description: "Sports equipment and fitness accessories.",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("categories", null, {});
  },
};
