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
      "suppliers",
      [
        {
          name: "မေတ္တာကုန်သွယ်ရေး",
          contact_person: "မောင်မောင်",
          email: "maungmaung@meittar.com",
          phone: "09450000001",
          address: "ရန်ကုန်မြို့၊ လှိုင်မြို့နယ်",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "ဝင်းကုန်သွယ်ရေး",
          contact_person: "အောင်အောင်",
          email: "aungaung@wintrading.com",
          phone: "09450000002",
          address: "မန္တလေးမြို့၊ ချမ်းအေးသာဇံ",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "အောင်မြင်စတိုး",
          contact_person: "သိန်းမြတ်",
          email: "theinmyat@successstore.com",
          phone: "09450000003",
          address: "နေပြည်တော်၊ ဗထူးမြို့နယ်",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "သိဒ္ဓိထုတ်လုပ်ရေး",
          contact_person: "စန္ဒာ",
          email: "sanda@thiddhi.com",
          phone: "09450000004",
          address: "ပုသိမ်မြို့၊ ဗဟိုလမ်းမကြီး",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "လှိုင်မြို့ကန်ကုမ္ပဏီ",
          contact_person: "ကျော်ကျော်",
          email: "kyawkyaw@hlaingcompany.com",
          phone: "09450000005",
          address: "ရန်ကုန်၊ လှိုင်မြို့နယ်",
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

    await queryInterface.bulkDelete("suppliers", null, {});
  },
};
