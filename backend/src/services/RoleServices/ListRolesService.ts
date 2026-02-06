import Role from "../../models/Role";
import Permission from "../../models/Permission";

const ListRolesService = async (): Promise<Role[]> => {
    const roles = await Role.findAll({
        include: [
            {
                model: Permission,
                as: "permissions",
                through: { attributes: [] }
            }
        ],
        order: [["name", "ASC"]]
    });

    return roles;
};

export default ListRolesService;
