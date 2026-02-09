import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        const now = new Date();
        const permissions = [
            // Webchat module
            { key: "webchat:view", name: "Visualizar", description: "Permite visualizar conversas webchat", module: "webchat" },
            { key: "webchat:edit", name: "Editar", description: "Permite editar conversas webchat", module: "webchat" },
            { key: "webchat:create", name: "Criar", description: "Permite criar conversas webchat", module: "webchat" },
            { key: "webchat:delete", name: "Deletar", description: "Permite deletar conversas webchat", module: "webchat" }
        ];

        await queryInterface.bulkInsert("Permissions", permissions.map(p => ({
            ...p,
            createdAt: now,
            updatedAt: now
        })));
    },

    down: async (queryInterface: QueryInterface) => {
        const keys = [
            "webchat:view",
            "webchat:edit",
            "webchat:create",
            "webchat:delete"
        ];

        await queryInterface.bulkDelete("Permissions", { key: keys });
    }
};
