import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        // Check if CloseReasons table already exists (dialect-agnostic)
        let tableExists = false;
        try {
            await queryInterface.describeTable("CloseReasons");
            tableExists = true;
        } catch (e) {
            tableExists = false;
        }

        if (!tableExists) {
            await queryInterface.createTable("CloseReasons", {
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
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                category: {
                    type: DataTypes.ENUM("positive", "negative"),
                    allowNull: false,
                    defaultValue: "positive"
                },
                color: {
                    type: DataTypes.STRING(20),
                    allowNull: false,
                    defaultValue: "#9e9e9e"
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true
                },
                order: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                formId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "ContactForms",
                        key: "id"
                    },
                    onUpdate: "CASCADE",
                    onDelete: "SET NULL"
                },
                tenantId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Companies",
                        key: "id"
                    },
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

            // Add indexes
            await queryInterface.addIndex("CloseReasons", ["tenantId"]);
            await queryInterface.addIndex("CloseReasons", ["isActive"]);
        }

        // Add closeReasonId to Tickets table if not exists
        const tableInfo = await queryInterface.describeTable("Tickets") as any;

        if (!tableInfo["closeReasonId"]) {
            await queryInterface.addColumn("Tickets", "closeReasonId", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "CloseReasons",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            });
            // Add index for closeReasonId in Tickets
            await queryInterface.addIndex("Tickets", ["closeReasonId"]);
        }

        // Add closedAt to Tickets table
        if (!tableInfo["closedAt"]) {
            await queryInterface.addColumn("Tickets", "closedAt", {
                type: DataTypes.DATE,
                allowNull: true
            });
        }

        // Add closedBy to Tickets table
        if (!tableInfo["closedBy"]) {
            await queryInterface.addColumn("Tickets", "closedBy", {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "Users",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            });
        }
    },

    down: async (queryInterface: QueryInterface) => {
        // We can leave down migration as is, or make it idempotent too. 
        // Usually down migrations are destructive so we just try to remove.
        try {
            await queryInterface.removeColumn("Tickets", "closedBy");
        } catch (e) { }
        try {
            await queryInterface.removeColumn("Tickets", "closedAt");
        } catch (e) { }
        try {
            await queryInterface.removeColumn("Tickets", "closeReasonId");
        } catch (e) { }
        try {
            await queryInterface.dropTable("CloseReasons");
        } catch (e) { }
    }
};
