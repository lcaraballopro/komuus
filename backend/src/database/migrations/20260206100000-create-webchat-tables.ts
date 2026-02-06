import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        // Create WebchatChannels table
        await queryInterface.createTable("WebchatChannels", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING
            },
            isActive: {
                defaultValue: true,
                type: DataTypes.BOOLEAN
            },
            primaryColor: {
                defaultValue: "#6366f1",
                type: DataTypes.STRING
            },
            position: {
                defaultValue: "bottom-right",
                type: DataTypes.STRING
            },
            welcomeMessage: {
                type: DataTypes.TEXT
            },
            offlineMessage: {
                type: DataTypes.TEXT
            },
            avatarUrl: {
                type: DataTypes.STRING
            },
            buttonText: {
                type: DataTypes.STRING
            },
            allowedDomains: {
                defaultValue: [],
                type: DataTypes.ARRAY(DataTypes.STRING)
            },
            aiAgentId: {
                type: DataTypes.INTEGER,
                references: { model: "AIAgents", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            queueId: {
                type: DataTypes.INTEGER,
                references: { model: "Queues", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            tenantId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        });

        // Create WebchatSessions table
        await queryInterface.createTable("WebchatSessions", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            channelId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: { model: "WebchatChannels", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            sessionToken: {
                allowNull: false,
                type: DataTypes.UUID,
                unique: true
            },
            visitorName: {
                type: DataTypes.STRING
            },
            visitorEmail: {
                type: DataTypes.STRING
            },
            visitorPhone: {
                type: DataTypes.STRING
            },
            ipAddress: {
                type: DataTypes.STRING
            },
            userAgent: {
                type: DataTypes.TEXT
            },
            referrerUrl: {
                type: DataTypes.STRING
            },
            status: {
                defaultValue: "active",
                type: DataTypes.STRING
            },
            contactId: {
                type: DataTypes.INTEGER,
                references: { model: "Contacts", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            ticketId: {
                type: DataTypes.INTEGER,
                references: { model: "Tickets", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            lastActivityAt: {
                type: DataTypes.DATE
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        });

        // Create WebchatMessages table
        await queryInterface.createTable("WebchatMessages", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            sessionId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: { model: "WebchatSessions", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            body: {
                allowNull: false,
                type: DataTypes.TEXT
            },
            sender: {
                allowNull: false,
                type: DataTypes.STRING
            },
            agentId: {
                type: DataTypes.INTEGER,
                references: { model: "Users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },
            isRead: {
                defaultValue: false,
                type: DataTypes.BOOLEAN
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        });

        // Add indexes
        await queryInterface.addIndex("WebchatChannels", ["tenantId"]);
        await queryInterface.addIndex("WebchatSessions", ["channelId"]);
        await queryInterface.addIndex("WebchatSessions", ["sessionToken"]);
        await queryInterface.addIndex("WebchatSessions", ["status"]);
        await queryInterface.addIndex("WebchatMessages", ["sessionId"]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable("WebchatMessages");
        await queryInterface.dropTable("WebchatSessions");
        await queryInterface.dropTable("WebchatChannels");
    }
};
