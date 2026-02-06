import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("AIAgents", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            webhookUrl: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            apiToken: {
                type: DataTypes.STRING,
                allowNull: true
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("AIAgents");
    }
};
