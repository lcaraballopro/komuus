import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        // 1. Create TelephonyChannels table
        await queryInterface.createTable("TelephonyChannels", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            trunkUsername: {
                type: DataTypes.STRING,
                allowNull: false
            },
            trunkPassword: {
                type: DataTypes.STRING,
                allowNull: false
            },
            trunkDomain: {
                type: DataTypes.STRING,
                allowNull: false
            },
            trunkPort: {
                type: DataTypes.INTEGER,
                defaultValue: 5060
            },
            context: {
                type: DataTypes.STRING,
                defaultValue: "default"
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            queueId: {
                type: DataTypes.INTEGER,
                references: { model: "Queues", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            tenantId: {
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
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

        // 2. Add telephonyId to Tickets table
        await queryInterface.addColumn("Tickets", "telephonyId", {
            type: DataTypes.INTEGER,
            references: { model: "TelephonyChannels", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            allowNull: true
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn("Tickets", "telephonyId");
        await queryInterface.dropTable("TelephonyChannels");
    }
};
