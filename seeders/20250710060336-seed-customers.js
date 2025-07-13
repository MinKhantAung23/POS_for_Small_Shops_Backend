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
      "customers",
      [
        {
          name: "မောင်မောင်",
          email: "maungmaung@example.com",
          phone: "09450000001",
          address: "ရန်ကုန်မြို့၊ လှိုင်မြို့နယ်",
          loyalty_points: 20,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "အောင်အောင်",
          email: "aungaung@example.com",
          phone: "09450000002",
          address: "မန္တလေးမြို့၊ ချမ်းအေးသာဇံ",
          loyalty_points: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "ခင်မောင်ထွန်း",
          email: "khinhtun@example.com",
          phone: "09450000003",
          address: "နေပြည်တော်၊ ဗထူးမြို့နယ်",
          loyalty_points: 35,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "စန်းစန်းမြင့်",
          email: "sansan@example.com",
          phone: "09450000004",
          address: "ပုသိမ်မြို့၊ ဗဟိုလမ်းမကြီး",
          loyalty_points: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "မြင့်မြင့်စု",
          email: "myintsu@example.com",
          phone: "09450000005",
          address: "မေမြို့၊ ဥတ္တရသီရိမြို့နယ်",
          loyalty_points: 50,
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

    await queryInterface.bulkDelete("customers", null, {});
  },
};
