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
      "products",
      [
        {
          name: "အာလူးချောင်း",
          // sku: "SKU1001",
          barcode: "1234567890123",
          description: "အရသာရှိသောအာလူးချောင်း",
          price: 500.0,
          cost_price: 300.0,
          stock: 50,
          image_url: 'https://images.unsplash.com/photo-1549049950-48d5887197a0?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          is_active: true,
          category_id: 3,
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "မုန့်ဟင်းခါးအထုပ်",
          // sku: "SKU1002",
          barcode: "2345678901234",
          description: "အမြန်ချက်စား မုန့်ဟင်းခါးအထုပ်",
          price: 1000.0,
          cost_price: 750.0,
          stock: 30,
          image_url: 'https://images.unsplash.com/photo-1549049950-48d5887197a0?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          is_active: true,
          category_id: 3,
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "ဝက်သားခြောက်",
          // sku: "SKU1003",
          barcode: "3456789012345",
          description: "အရသာထူးခြားသော ဝက်သားခြောက်",
          price: 2500.0,
          cost_price: 1800.0,
          stock: 20,
          image_url: 'https://images.unsplash.com/photo-1549049950-48d5887197a0?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          is_active: true,
          category_id: 3,
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "အေးမြသောက်ရေ",
          sku: "SKU1004",
          barcode: "4567890123456",
          description: "သန့်ရှင်းသောအေးမြသောက်ရေ ၁ လီတာ",
          price: 300.0,
          cost_price: 100.0,
          stock: 100,
          image_url: 'https://images.unsplash.com/photo-1549049950-48d5887197a0?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          is_active: true,
          category_id: 3,
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "ကြက်သားအထုပ်",
          sku: "SKU1005",
          barcode: "5678901234567",
          description: "အရည်အသွေးမြင့် ကြက်သားအထုပ်",
          price: 3200.0,
          cost_price: 2500.0,
          stock: 25,
          image_url: 'https://images.unsplash.com/photo-1549049950-48d5887197a0?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          is_active: true,
          category_id: 3,
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Electronic gadgets and devices",
          sku: "SKU1006",
          barcode: "6789012345678",
          description: "Electronic gadgets and devices",
          price: 5000.0,
          cost_price: 4000.0,
          stock: 15,
          image_url: 'https://images.unsplash.com/photo-1549049950-48d5887197a0?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          is_active: true,
          category_id: 1,
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        }
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

    await queryInterface.bulkDelete("products", null, {});
  },
};
