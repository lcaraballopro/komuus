import Role from "../../models/Role";
import User from "../../models/User";
import AppError from "../../errors/AppError";

const DeleteRoleService = async (id: string | number): Promise<void> => {
    const role = await Role.findByPk(id);

    if (!role) {
        throw new AppError("ERR_ROLE_NOT_FOUND", 404);
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
        throw new AppError("ERR_CANNOT_DELETE_SYSTEM_ROLE", 400);
    }

    // Check if any users are assigned to this role
    const usersWithRole = await User.count({ where: { roleId: role.id } });
    if (usersWithRole > 0) {
        throw new AppError("ERR_ROLE_IN_USE", 400);
    }

    await role.destroy();
};

export default DeleteRoleService;
