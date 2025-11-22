'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('photos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      audit_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'audits',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      answer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'answers',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      cloudinary_public_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      thumbnail_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      format: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bytes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      meta: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('photos', ['audit_id']);
    await queryInterface.addIndex('photos', ['answer_id']);
    await queryInterface.addIndex('photos', ['user_id']);
    await queryInterface.addIndex('photos', ['cloudinary_public_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('photos');
  },
};
