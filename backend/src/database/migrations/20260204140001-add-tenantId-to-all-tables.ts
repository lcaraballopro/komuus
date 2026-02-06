import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
        // Add tenantId to Users
        await queryInterface.addColumn("Users", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("Users", ["tenantId"]);

        // Add tenantId to Contacts
        await queryInterface.addColumn("Contacts", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("Contacts", ["tenantId"]);
        // Remove old unique constraint and add new one with tenantId
        try {
            await queryInterface.removeConstraint("Contacts", "Contacts_number_key");
        } catch {
            // Constraint may not exist
        }
        await queryInterface.addIndex("Contacts", ["number", "tenantId"], {
            unique: true,
            name: "Contacts_number_tenantId_unique"
        });

        // Add tenantId to Tickets
        await queryInterface.addColumn("Tickets", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("Tickets", ["tenantId"]);

        // Add tenantId to Messages
        await queryInterface.addColumn("Messages", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("Messages", ["tenantId"]);

        // Add tenantId to Whatsapps
        await queryInterface.addColumn("Whatsapps", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("Whatsapps", ["tenantId"]);

        // Add tenantId to Queues
        await queryInterface.addColumn("Queues", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("Queues", ["tenantId"]);

        // Add tenantId to QuickAnswers
        await queryInterface.addColumn("QuickAnswers", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("QuickAnswers", ["tenantId"]);

        // Add tenantId to Settings
        await queryInterface.addColumn("Settings", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("Settings", ["tenantId"]);

        // Add tenantId to AIAgents
        await queryInterface.addColumn("AIAgents", "tenantId", {
            type: Sequelize.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
        await queryInterface.addIndex("AIAgents", ["tenantId"]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn("Users", "tenantId");
        await queryInterface.removeColumn("Contacts", "tenantId");
        await queryInterface.removeColumn("Tickets", "tenantId");
        await queryInterface.removeColumn("Messages", "tenantId");
        await queryInterface.removeColumn("Whatsapps", "tenantId");
        await queryInterface.removeColumn("Queues", "tenantId");
        await queryInterface.removeColumn("QuickAnswers", "tenantId");
        await queryInterface.removeColumn("Settings", "tenantId");
        await queryInterface.removeColumn("AIAgents", "tenantId");
    }
};
