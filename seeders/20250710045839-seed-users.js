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
      "users",
      [
        {
          name: "Admin",
          email: "admin@gmail.com",
          password: "asdffdsa",
          role_id: 1,
          image_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Manager",
          email: "manager@gmail.com",
          password: "123456",
          role_id: 2,
          image_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Sales Assistant",
          email: "salesassistant@gmail.com",
          password: "123456",
          role_id: 3,
          image_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "cashier",
          email: "cashier@gmail.com",
          password: "123456",
          role_id: 4,
          image_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "cashier2",
          email: "cashier2@gmail.com",
          password: "123456",
          role_id: 4,
          image_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "accountant",
          email: "accountant@gmail.com",
          password: "123456",
          role_id: 5,
          image_url: null,
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

    await queryInterface.bulkDelete("users", null, {});
  },
};
