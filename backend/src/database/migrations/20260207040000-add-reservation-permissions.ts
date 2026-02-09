import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        const now = new Date();

        const permissions = [
            {
                key: "reservations:view",
                name: "Ver reservas",
                description: "Permite visualizar reservas",
                module: "reservations",
                createdAt: now,
                updatedAt: now,
            },
            {
                key: "reservations:create",
                name: "Criar reservas",
                description: "Permite criar novas reservas",
                module: "reservations",
                createdAt: now,
                updatedAt: now,
            },
            {
                key: "reservations:edit",
                name: "Editar reservas",
                description: "Permite editar reservas existentes",
                module: "reservations",
                createdAt: now,
                updatedAt: now,
            },
            {
                key: "reservations:delete",
                name: "Deletar reservas",
                description: "Permite deletar reservas",
                module: "reservations",
                createdAt: now,
                updatedAt: now,
            },
        ];

        // Idempotent insert for permissions
        for (const perm of permissions) {
            const [existing] = await queryInterface.sequelize.query(
                `SELECT id FROM Permissions WHERE \`key\` = '${perm.key}' LIMIT 1`
            ) as [{ id: number }[], unknown];

            if (!existing || existing.length === 0) {
                await queryInterface.bulkInsert("Permissions", [perm]);
            }
        }

        // Get role IDs
        const [rolesResult]: any = await queryInterface.sequelize.query(
            `SELECT id, name FROM Roles`
        );

        // Get permission IDs
        const [permissionsResult]: any = await queryInterface.sequelize.query(
            `SELECT id, \`key\` FROM Permissions`
        );

        const roleMap: { [key: string]: number } = {};
        rolesResult.forEach((r: any) => {
            roleMap[r.name] = r.id;
        });

        const permMap: { [key: string]: number } = {};
        permissionsResult.forEach((p: any) => {
            permMap[p.key] = p.id;
        });

        const newPermissions = [
            "reservations:view",
            "reservations:create",
            "reservations:edit",
            "reservations:delete",
        ];

        const rolesToUpdate = ["Administrador", "Supervisor", "Agente"];
        const associations: {
            roleId: number;
            permissionId: number;
            createdAt: Date;
            updatedAt: Date;
        }[] = [];

        for (const roleName of rolesToUpdate) {
            const roleId = roleMap[roleName];
            if (!roleId) continue;

            for (const permKey of newPermissions) {
                const permissionId = permMap[permKey];
                if (permissionId) {
                    associations.push({
                        roleId,
                        permissionId,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }
        }

        if (associations.length > 0) {
            // Check for existing associations to avoid duplicates?
            // Simplest way for seed data is to ignore duplicates if possible,
            // or we can rely on RolePermissions table allowing duplicates (if no unique constraint).
            // But better: checks.
            // Since we are adding NEW permissions to existing roles,
            // we can try to delete them first (for these specific permissions) then insert.

            // Get IDs of the new permissions
            const newPermissionIds = newPermissions.map(key => permMap[key]).filter(id => !!id);

            if (newPermissionIds.length > 0) {
                // Delete existing associations for these permissions and roles
                const roleIds = rolesToUpdate.map(r => roleMap[r]).filter(id => !!id);
                if (roleIds.length > 0) {
                    try {
                        // This delete might be complex via raw SQL if we want to filter by BOTH roleId AND permissionId
                        // "DELETE FROM RolePermissions WHERE roleId IN (...) AND permissionId IN (...)"
                        await queryInterface.sequelize.query(
                            `DELETE FROM RolePermissions WHERE roleId IN (${roleIds.join(',')}) AND permissionId IN (${newPermissionIds.join(',')})`
                        );
                    } catch (e) {
                        console.error("Failed to cleanup existing associations", e);
                    }
                }
            }

            await queryInterface.bulkInsert("RolePermissions", associations);
        }
    },

    down: async (queryInterface: QueryInterface) => {
        const keys = [
            "reservations:view",
            "reservations:create",
            "reservations:edit",
            "reservations:delete",
        ];

        try {
            const [permissionsResult]: any = await queryInterface.sequelize.query(
                `SELECT id FROM Permissions WHERE \`key\` IN (${keys
                    .map((k) => `'${k}'`)
                    .join(",")})`
            );

            const permissionIds = permissionsResult.map((p: any) => p.id);

            if (permissionIds.length > 0) {
                await queryInterface.bulkDelete("RolePermissions", {
                    permissionId: permissionIds,
                });
            }

            await queryInterface.bulkDelete("Permissions", { key: keys });
        } catch (e) {
            console.error("Down migration failed", e);
        }
    },
};
