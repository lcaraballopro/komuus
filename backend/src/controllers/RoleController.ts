import { Request, Response } from "express";
import AppError from "../errors/AppError";

import ListRolesService from "../services/RoleServices/ListRolesService";
import ShowRoleService from "../services/RoleServices/ShowRoleService";
import CreateRoleService from "../services/RoleServices/CreateRoleService";
import UpdateRoleService from "../services/RoleServices/UpdateRoleService";
import DeleteRoleService from "../services/RoleServices/DeleteRoleService";
import ListPermissionsService from "../services/PermissionServices/ListPermissionsService";

// Middleware check for superadmin
const checkSuperAdmin = (req: Request) => {
    if (req.user.profile !== "superadmin") {
        throw new AppError("ERR_NO_PERMISSION", 403);
    }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const roles = await ListRolesService();
    return res.json(roles);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { roleId } = req.params;
    const role = await ShowRoleService(roleId);
    return res.json(role);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { name, description, permissionIds } = req.body;

    const role = await CreateRoleService({
        name,
        description,
        permissionIds
    });

    return res.status(201).json(role);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { roleId } = req.params;
    const { name, description, permissionIds } = req.body;

    const role = await UpdateRoleService({
        id: roleId,
        name,
        description,
        permissionIds
    });

    return res.json(role);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { roleId } = req.params;
    await DeleteRoleService(roleId);

    return res.json({ message: "Role deleted" });
};

export const listPermissions = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const permissions = await ListPermissionsService();
    return res.json(permissions);
};
