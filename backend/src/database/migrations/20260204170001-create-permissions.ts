import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Permissions", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            key: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            module: {
                type: DataTypes.STRING,
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

        // Seed default permissions
        const now = new Date();
        const permissions = [
            // Tickets module
            { key: "tickets:view", name: "Ver tickets", description: "Permite ver la lista de tickets", module: "tickets" },
            { key: "tickets:create", name: "Crear tickets", description: "Permite crear nuevos tickets", module: "tickets" },
            { key: "tickets:edit", name: "Editar tickets", description: "Permite editar tickets existentes", module: "tickets" },
            { key: "tickets:delete", name: "Eliminar tickets", description: "Permite eliminar tickets", module: "tickets" },
            { key: "tickets:transfer", name: "Transferir tickets", description: "Permite transferir tickets a otros usuarios", module: "tickets" },

            // Contacts module
            { key: "contacts:view", name: "Ver contactos", description: "Permite ver la lista de contactos", module: "contacts" },
            { key: "contacts:create", name: "Crear contactos", description: "Permite crear nuevos contactos", module: "contacts" },
            { key: "contacts:edit", name: "Editar contactos", description: "Permite editar contactos existentes", module: "contacts" },
            { key: "contacts:delete", name: "Eliminar contactos", description: "Permite eliminar contactos", module: "contacts" },
            { key: "contacts:import", name: "Importar contactos", description: "Permite importar contactos masivamente", module: "contacts" },

            // Users module
            { key: "users:view", name: "Ver usuarios", description: "Permite ver la lista de usuarios", module: "users" },
            { key: "users:create", name: "Crear usuarios", description: "Permite crear nuevos usuarios", module: "users" },
            { key: "users:edit", name: "Editar usuarios", description: "Permite editar usuarios existentes", module: "users" },
            { key: "users:delete", name: "Eliminar usuarios", description: "Permite eliminar usuarios", module: "users" },

            // Queues module
            { key: "queues:view", name: "Ver colas", description: "Permite ver las colas de atención", module: "queues" },
            { key: "queues:manage", name: "Administrar colas", description: "Permite crear, editar y eliminar colas", module: "queues" },

            // Connections module
            { key: "connections:view", name: "Ver conexiones", description: "Permite ver las conexiones de WhatsApp", module: "connections" },
            { key: "connections:manage", name: "Administrar conexiones", description: "Permite crear, editar y eliminar conexiones", module: "connections" },

            // Quick Answers module
            { key: "quickAnswers:view", name: "Ver respuestas rápidas", description: "Permite ver respuestas rápidas", module: "quickAnswers" },
            { key: "quickAnswers:manage", name: "Administrar respuestas", description: "Permite crear, editar y eliminar respuestas", module: "quickAnswers" },

            // Settings module
            { key: "settings:view", name: "Ver configuración", description: "Permite ver la configuración", module: "settings" },
            { key: "settings:manage", name: "Administrar configuración", description: "Permite modificar la configuración", module: "settings" },

            // Reports module
            { key: "reports:view", name: "Ver reportes", description: "Permite ver reportes y estadísticas", module: "reports" },

            // Campaigns module
            { key: "campaigns:view", name: "Ver campañas", description: "Permite ver campañas de mensajes", module: "campaigns" },
            { key: "campaigns:manage", name: "Administrar campañas", description: "Permite crear, editar y eliminar campañas", module: "campaigns" },

            // AI Agents module
            { key: "aiAgents:view", name: "Ver agentes IA", description: "Permite ver agentes de IA", module: "aiAgents" },
            { key: "aiAgents:manage", name: "Administrar agentes IA", description: "Permite crear, editar y eliminar agentes IA", module: "aiAgents" },
        ];

        await queryInterface.bulkInsert("Permissions", permissions.map(p => ({
            ...p,
            createdAt: now,
            updatedAt: now
        })));
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("Permissions");
    }
};
