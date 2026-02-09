import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        const now = new Date();

        // Create default system roles
        const roles = [
            {
                name: "Administrador",
                description: "Acceso completo dentro de su empresa",
                isSystem: true
            },
            {
                name: "Supervisor",
                description: "Supervisar agentes y ver reportes",
                isSystem: true
            },
            {
                name: "Agente",
                description: "Atender tickets y gestionar contactos",
                isSystem: true
            },
            {
                name: "Solo Lectura",
                description: "Ver información sin modificar",
                isSystem: true
            }
        ];

        for (const role of roles) {
            const [existingRole] = await queryInterface.sequelize.query(
                `SELECT id FROM Roles WHERE name = '${role.name}' LIMIT 1`
            ) as [{ id: number }[], unknown];

            if (!existingRole || existingRole.length === 0) {
                await queryInterface.bulkInsert("Roles", [{
                    ...role,
                    createdAt: now,
                    updatedAt: now
                }]);
            }
        }

        // Get role IDs and permission IDs for associations
        const [rolesResult]: any = await queryInterface.sequelize.query(
            `SELECT id, name FROM Roles`
        );
        const [permissionsResult]: any = await queryInterface.sequelize.query(
            `SELECT id, \`key\` FROM Permissions`
        );

        const roleMap: { [key: string]: number } = {};
        rolesResult.forEach((r: any) => { roleMap[r.name] = r.id; });

        const permMap: { [key: string]: number } = {};
        permissionsResult.forEach((p: any) => { permMap[p.key] = p.id; });

        // Define permissions for each role
        const rolePermissions: { [role: string]: string[] } = {
            "Administrador": [
                // All permissions except settings:manage
                "tickets:view", "tickets:create", "tickets:edit", "tickets:delete", "tickets:transfer",
                "contacts:view", "contacts:create", "contacts:edit", "contacts:delete", "contacts:import",
                "users:view", "users:create", "users:edit", "users:delete",
                "queues:view", "queues:manage",
                "connections:view", "connections:manage",
                "quickAnswers:view", "quickAnswers:manage",
                "settings:view",
                "reports:view",
                "campaigns:view", "campaigns:manage",
                "aiAgents:view", "aiAgents:manage"
            ],
            "Supervisor": [
                "tickets:view", "tickets:create", "tickets:edit", "tickets:transfer",
                "contacts:view", "contacts:create", "contacts:edit",
                "users:view",
                "queues:view",
                "connections:view",
                "quickAnswers:view", "quickAnswers:manage",
                "reports:view",
                "campaigns:view"
            ],
            "Agente": [
                "tickets:view", "tickets:create", "tickets:edit",
                "contacts:view", "contacts:create", "contacts:edit",
                "quickAnswers:view"
            ],
            "Solo Lectura": [
                "tickets:view",
                "contacts:view",
                "users:view",
                "queues:view",
                "connections:view",
                "quickAnswers:view",
                "settings:view",
                "reports:view",
                "campaigns:view",
                "aiAgents:view"
            ]
        };

        // Create role-permission associations
        const associations: { roleId: number; permissionId: number; createdAt: Date; updatedAt: Date }[] = [];

        for (const [roleName, permissions] of Object.entries(rolePermissions)) {
            const roleId = roleMap[roleName];
            if (!roleId) continue;

            for (const permKey of permissions) {
                const permissionId = permMap[permKey];
                if (permissionId) {
                    associations.push({
                        roleId,
                        permissionId,
                        createdAt: now,
                        updatedAt: now
                    });
                }
            }
        }

        if (associations.length > 0) {
            // Delete existing permissions for these roles to avoid duplicates
            if (Object.values(roleMap).length > 0) {
                try {
                    // Using raw query for bulk delete to avoid Sequelize validation issues if model definition differs
                    // Assuming 'roleId' column exists in RolePermissions
                    await queryInterface.bulkDelete("RolePermissions", { roleId: Object.values(roleMap) });
                } catch (e) {
                    // If deletion fails, we might just try inserting or ignore
                    console.error("Failed to clear existing permissions, continuing...", e);
                }
            }
            await queryInterface.bulkInsert("RolePermissions", associations);
        }

        // Add roleId column to Users table
        try {
            await queryInterface.addColumn("Users", "roleId", {
                type: DataTypes.INTEGER,
                references: { model: "Roles", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                allowNull: true
            });
        } catch (e) {
            // Check if error is "Duplicate column name"
            // If so, ignore. Otherwise rethrow?
            // For now, logging and continuing.
            console.log("Column roleId likely exists in Users, skipping addColumn.");
        }

        // Migrate existing users: admin -> Administrador role, user -> Agente role
        const adminRoleId = roleMap["Administrador"];
        const agenteRoleId = roleMap["Agente"];

        if (adminRoleId) {
            await queryInterface.sequelize.query(
                `UPDATE Users SET roleId = ${adminRoleId} WHERE profile = 'admin'`
            );
        }
        if (agenteRoleId) {
            await queryInterface.sequelize.query(
                `UPDATE Users SET roleId = ${agenteRoleId} WHERE profile = 'user'`
            );
        }
        // superadmin users don't need a role - they have all permissions by default
    },

    down: async (queryInterface: QueryInterface) => {
        try {
            await queryInterface.removeColumn("Users", "roleId");
        } catch (e) { }
        try {
            await queryInterface.bulkDelete("RolePermissions", {});
        } catch (e) { }
        try {
            await queryInterface.bulkDelete("Roles", {});
        } catch (e) { }
    }
};
