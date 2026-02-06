import User from "../../models/User";
import Role from "../../models/Role";
import Permission from "../../models/Permission";

const UserHasPermissionService = async (
    userId: number,
    permissionKey: string
): Promise<boolean> => {
    const user = await User.findByPk(userId, {
        include: [
            {
                model: Role,
                as: "role",
                include: [
                    {
                        model: Permission,
                        as: "permissions",
                        through: { attributes: [] }
                    }
                ]
            }
        ]
    });

    if (!user || !user.role) {
        return false;
    }

    const hasPermission = user.role.permissions.some(
        (p: Permission) => p.key === permissionKey
    );

    return hasPermission;
};

export default UserHasPermissionService;
