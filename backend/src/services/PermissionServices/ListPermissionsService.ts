import Permission from "../../models/Permission";

interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

const ListPermissionsService = async (): Promise<PermissionGroup[]> => {
    const permissions = await Permission.findAll({
        order: [["module", "ASC"], ["name", "ASC"]]
    });

    // Group permissions by module
    const grouped: { [key: string]: Permission[] } = {};

    for (const permission of permissions) {
        if (!grouped[permission.module]) {
            grouped[permission.module] = [];
        }
        grouped[permission.module].push(permission);
    }

    return Object.entries(grouped).map(([module, perms]) => ({
        module,
        permissions: perms
    }));
};

export default ListPermissionsService;
