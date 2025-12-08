'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('templates');
    if (!table.restrictPhotoAge) {
      await queryInterface.addColumn('templates', 'restrictPhotoAge', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('templates', 'restrictPhotoAge');
  }
};
