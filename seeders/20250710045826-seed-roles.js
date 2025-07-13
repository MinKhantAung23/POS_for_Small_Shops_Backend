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
      "roles",
      [
        {
          name: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "manager",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "sales_assistant",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "cashier",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "accountant",
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

    await queryInterface.bulkDelete("roles", null, {});
  },
};
