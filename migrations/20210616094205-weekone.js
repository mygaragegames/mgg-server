'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.addColumn('games', 'isInQueue', {type: Sequelize.BOOLEAN, defaultValue: true});
     await queryInterface.addColumn('games', 'themeFont', {type: Sequelize.INTEGER, defaultValue: 0});
     await queryInterface.addColumn('games', 'themeColor', {type: Sequelize.STRING, defaultValue: "#25b9ff"});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.removeColumn('games', 'isInQueue');
     await queryInterface.removeColumn('games', 'themeFont');
     await queryInterface.removeColumn('games', 'themeColor');
  }
};
