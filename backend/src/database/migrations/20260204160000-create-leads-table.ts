import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Leads", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true
            },
            sessionId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            source: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "landing-chat"
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "new"
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true
            },
            tenantId: {
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                allowNull: true
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

        // Add indexes for common lookups
        await queryInterface.addIndex("Leads", ["email"]);
        await queryInterface.addIndex("Leads", ["phone"]);
        await queryInterface.addIndex("Leads", ["sessionId"]);
        await queryInterface.addIndex("Leads", ["tenantId"]);
        await queryInterface.addIndex("Leads", ["status"]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable("Leads");
    }
};
