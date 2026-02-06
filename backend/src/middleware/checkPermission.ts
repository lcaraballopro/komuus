import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import UserHasPermissionService from "../services/PermissionServices/UserHasPermissionService";

/**
 * Middleware to check if the current user has a specific permission.
 * Superadmin users bypass all permission checks.
 * 
 * @param permission - The permission key to check (e.g., "tickets:view")
 */
const checkPermission = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Superadmin always has all permissions
        if (req.user.profile === "superadmin") {
            return next();
        }

        // Admin has all permissions within their tenant (backward compatibility)
        if (req.user.profile === "admin") {
            return next();
        }

        // Check if user has the specific permission through their role
        const hasPermission = await UserHasPermissionService(Number(req.user.id), permission);

        if (!hasPermission) {
            throw new AppError("ERR_NO_PERMISSION", 403);
        }

        return next();
    };
};

export default checkPermission;
