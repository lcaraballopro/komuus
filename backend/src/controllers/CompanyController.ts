import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import ListCompaniesService from "../services/CompanyService/ListCompaniesService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import UpdateCompanyService from "../services/CompanyService/UpdateCompanyService";
import DeleteCompanyService from "../services/CompanyService/DeleteCompanyService";
import ListUsersService from "../services/UserServices/ListUsersService";

// Middleware check for superadmin (profile === "superadmin")
const checkSuperAdmin = (req: Request) => {
    if (req.user.profile !== "superadmin") {
        throw new AppError("ERR_NO_PERMISSION", 403);
    }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { searchParam } = req.query as { searchParam?: string };

    const { companies, count } = await ListCompaniesService({ searchParam });

    return res.json({ companies, count });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { name, slug, plan, isActive, maxUsers, maxWhatsapps } = req.body;

    const company = await CreateCompanyService({
        name,
        slug,
        plan,
        isActive,
        maxUsers,
        maxWhatsapps
    });

    const io = getIO();
    io.emit("company", {
        action: "create",
        company
    });

    return res.status(201).json(company);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { companyId } = req.params;

    const company = await ShowCompanyService(companyId);

    return res.status(200).json(company);
};

export const update = async (
    req: Request,
    res: Response
): Promise<Response> => {
    checkSuperAdmin(req);

    const { companyId } = req.params;
    const companyData = req.body;

    const company = await UpdateCompanyService({ companyData, companyId });

    const io = getIO();
    io.emit("company", {
        action: "update",
        company
    });

    return res.status(200).json(company);
};

export const remove = async (
    req: Request,
    res: Response
): Promise<Response> => {
    checkSuperAdmin(req);

    const { companyId } = req.params;

    await DeleteCompanyService(companyId);

    const io = getIO();
    io.emit("company", {
        action: "delete",
        companyId
    });

    return res.status(200).json({ message: "Company deleted" });
};

// List users for a specific company (superadmin only)
export const listUsers = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { companyId } = req.params;
    const { searchParam, pageNumber } = req.query as { searchParam?: string; pageNumber?: string };

    const { users, count, hasMore } = await ListUsersService({
        searchParam,
        pageNumber,
        tenantId: Number(companyId)
    });

    return res.json({ users, count, hasMore });
};

// Create user for a specific company (superadmin only)
export const createUser = async (req: Request, res: Response): Promise<Response> => {
    checkSuperAdmin(req);

    const { companyId } = req.params;
    const { name, email, password, profile } = req.body;

    // Import CreateUserService dynamically to avoid circular dependency
    const CreateUserService = require("../services/UserServices/CreateUserService").default;

    const user = await CreateUserService({
        name,
        email,
        password,
        profile: profile || "user",
        tenantId: Number(companyId)
    });

    const io = getIO();
    io.to(`tenant:${companyId}`).emit("user", {
        action: "create",
        user
    });

    return res.status(201).json(user);
};

