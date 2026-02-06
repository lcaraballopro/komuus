import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

/**
 * Middleware to check if the authenticated user has admin or superadmin profile.
 * Must be used after isAuth middleware.
 */
const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const { profile } = req.user as { id: string; profile: string; tenantId: number };

    if (profile !== "admin" && profile !== "superadmin") {
        throw new AppError("ERR_NO_PERMISSION", 403);
    }

    return next();
};

export default isAdmin;
