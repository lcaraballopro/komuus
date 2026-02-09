import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        // 1. Create ContactForms table
        await queryInterface.createTable("ContactForms", {
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
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            tenantId: {
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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

        // Add index for tenant filtering
        await queryInterface.addIndex("ContactForms", ["tenantId"]);

        // 2. Create ContactFormFields table
        await queryInterface.createTable("ContactFormFields", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            formId: {
                type: DataTypes.INTEGER,
                references: { model: "ContactForms", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "text"
                // Supported: text, textarea, select, checkbox, date, email, phone, number
            },
            label: {
                type: DataTypes.STRING,
                allowNull: false
            },
            placeholder: {
                type: DataTypes.STRING,
                allowNull: true
            },
            options: {
                type: DataTypes.JSON,
                allowNull: true
                // For select fields: ["Option 1", "Option 2", ...]
            },
            isRequired: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            order: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            tenantId: {
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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

        // Add indexes for ContactFormFields
        await queryInterface.addIndex("ContactFormFields", ["formId"]);
        await queryInterface.addIndex("ContactFormFields", ["tenantId"]);

        // 3. Create ContactFormResponses table
        await queryInterface.createTable("ContactFormResponses", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            formId: {
                type: DataTypes.INTEGER,
                references: { model: "ContactForms", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            ticketId: {
                type: DataTypes.INTEGER,
                references: { model: "Tickets", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                allowNull: true
            },
            contactId: {
                type: DataTypes.INTEGER,
                references: { model: "Contacts", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                allowNull: true
            },
            submittedBy: {
                type: DataTypes.INTEGER,
                references: { model: "Users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                allowNull: true
            },
            tenantId: {
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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

        // Add indexes for ContactFormResponses
        await queryInterface.addIndex("ContactFormResponses", ["formId"]);
        await queryInterface.addIndex("ContactFormResponses", ["ticketId"]);
        await queryInterface.addIndex("ContactFormResponses", ["contactId"]);
        await queryInterface.addIndex("ContactFormResponses", ["tenantId"]);

        // 4. Create ContactFormResponseValues table
        await queryInterface.createTable("ContactFormResponseValues", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            responseId: {
                type: DataTypes.INTEGER,
                references: { model: "ContactFormResponses", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            fieldId: {
                type: DataTypes.INTEGER,
                references: { model: "ContactFormFields", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false
            },
            value: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            tenantId: {
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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

        // Add indexes for ContactFormResponseValues
        await queryInterface.addIndex("ContactFormResponseValues", ["responseId"]);
        await queryInterface.addIndex("ContactFormResponseValues", ["fieldId"]);
        await queryInterface.addIndex("ContactFormResponseValues", ["tenantId"]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable("ContactFormResponseValues");
        await queryInterface.dropTable("ContactFormResponses");
        await queryInterface.dropTable("ContactFormFields");
        await queryInterface.dropTable("ContactForms");
    }
};
