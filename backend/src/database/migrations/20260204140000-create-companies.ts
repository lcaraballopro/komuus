import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
        await queryInterface.createTable("Companies", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            plan: {
                type: Sequelize.STRING,
                defaultValue: "basic"
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            maxUsers: {
                type: Sequelize.INTEGER,
                defaultValue: 10
            },
            maxWhatsapps: {
                type: Sequelize.INTEGER,
                defaultValue: 2
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable("Companies");
    }
};
