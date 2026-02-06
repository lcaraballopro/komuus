import Role from "../../models/Role";
import Permission from "../../models/Permission";
import AppError from "../../errors/AppError";

const ShowRoleService = async (id: string | number): Promise<Role> => {
    const role = await Role.findByPk(id, {
        include: [
            {
                model: Permission,
                as: "permissions",
                through: { attributes: [] }
            }
        ]
    });

    if (!role) {
        throw new AppError("ERR_ROLE_NOT_FOUND", 404);
    }

    return role;
};

export default ShowRoleService;
