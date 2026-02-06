import Role from "../../models/Role";
import RolePermission from "../../models/RolePermission";
import AppError from "../../errors/AppError";

interface Request {
    name: string;
    description?: string;
    permissionIds: number[];
}

const CreateRoleService = async ({
    name,
    description,
    permissionIds
}: Request): Promise<Role> => {
    // Check if role name already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
        throw new AppError("ERR_ROLE_NAME_ALREADY_EXISTS", 400);
    }

    const role = await Role.create({
        name,
        description,
        isSystem: false
    });

    // Create permission associations
    if (permissionIds && permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
            roleId: role.id,
            permissionId
        }));
        await RolePermission.bulkCreate(rolePermissions);
    }

    return role;
};

export default CreateRoleService;
