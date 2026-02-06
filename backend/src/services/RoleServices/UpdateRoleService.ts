import Role from "../../models/Role";
import RolePermission from "../../models/RolePermission";
import AppError from "../../errors/AppError";

interface Request {
    id: string | number;
    name?: string;
    description?: string;
    permissionIds?: number[];
}

const UpdateRoleService = async ({
    id,
    name,
    description,
    permissionIds
}: Request): Promise<Role> => {
    const role = await Role.findByPk(id);

    if (!role) {
        throw new AppError("ERR_ROLE_NOT_FOUND", 404);
    }

    // Check if trying to rename to an existing name
    if (name && name !== role.name) {
        const existingRole = await Role.findOne({ where: { name } });
        if (existingRole) {
            throw new AppError("ERR_ROLE_NAME_ALREADY_EXISTS", 400);
        }
    }

    await role.update({
        name: name || role.name,
        description: description !== undefined ? description : role.description
    });

    // Update permissions if provided
    if (permissionIds !== undefined) {
        // Remove existing permissions
        await RolePermission.destroy({ where: { roleId: role.id } });

        // Add new permissions
        if (permissionIds.length > 0) {
            const rolePermissions = permissionIds.map(permissionId => ({
                roleId: role.id,
                permissionId
            }));
            await RolePermission.bulkCreate(rolePermissions);
        }
    }

    return role;
};

export default UpdateRoleService;
