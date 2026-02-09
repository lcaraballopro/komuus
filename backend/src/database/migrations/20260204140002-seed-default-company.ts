import { QueryInterface } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        // Create default company
        const [existingCompany] = await queryInterface.sequelize.query(
            `SELECT id FROM Companies WHERE slug = 'default' LIMIT 1`
        ) as [{ id: number }[], unknown];

        if (!existingCompany || existingCompany.length === 0) {
            await queryInterface.bulkInsert("Companies", [{
                name: "Default Company",
                slug: "default",
                plan: "enterprise",
                isActive: true,
                maxUsers: 100,
                maxWhatsapps: 50,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
        }

        // Get the default company ID
        const [defaultCompany] = await queryInterface.sequelize.query(
            `SELECT id FROM Companies WHERE slug = 'default' LIMIT 1`
        ) as [{ id: number }[], unknown];
        const defaultTenantId = defaultCompany[0]?.id || 1;

        // Update all existing records to belong to default company
        await queryInterface.sequelize.query(
            `UPDATE Users SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
        await queryInterface.sequelize.query(
            `UPDATE Contacts SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
        await queryInterface.sequelize.query(
            `UPDATE Tickets SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
        await queryInterface.sequelize.query(
            `UPDATE Messages SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
        await queryInterface.sequelize.query(
            `UPDATE Whatsapps SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
        await queryInterface.sequelize.query(
            `UPDATE Queues SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
        await queryInterface.sequelize.query(
            `UPDATE QuickAnswers SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
        await queryInterface.sequelize.query(
            `UPDATE Settings SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
        await queryInterface.sequelize.query(
            `UPDATE AIAgents SET tenantId = ${defaultTenantId} WHERE tenantId IS NULL`
        );
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete("Companies", { slug: "default" });
    }
};
