import { QueryInterface } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        // Check if a webchat channel already exists for tenant 1
        const [existing] = await queryInterface.sequelize.query(
            `SELECT id FROM WebchatChannels WHERE tenantId = 1 LIMIT 1`
        ) as any[];

        if (!existing || existing.length === 0) {
            await queryInterface.bulkInsert("WebchatChannels", [{
                name: "Widget Principal",
                isActive: true,
                primaryColor: "#6366f1",
                position: "bottom-right",
                welcomeMessage: "¡Hola! ¿En qué podemos ayudarte?",
                offlineMessage: "No estamos disponibles en este momento.",
                buttonText: "Chat",
                allowedDomains: JSON.stringify([]),
                tenantId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
        }
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete("WebchatChannels", {
            name: "Widget Principal",
            tenantId: 1
        } as any);
    }
};
