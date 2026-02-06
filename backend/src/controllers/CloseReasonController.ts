import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateCloseReasonService from "../services/CloseReasonService/CreateCloseReasonService";
import ListCloseReasonsService from "../services/CloseReasonService/ListCloseReasonsService";
import ShowCloseReasonService from "../services/CloseReasonService/ShowCloseReasonService";
import UpdateCloseReasonService from "../services/CloseReasonService/UpdateCloseReasonService";
import DeleteCloseReasonService from "../services/CloseReasonService/DeleteCloseReasonService";

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { activeOnly, whatsappId } = req.query;

    const closeReasons = await ListCloseReasonsService({
        tenantId,
        whatsappId: whatsappId ? Number(whatsappId) : undefined,
        activeOnly: activeOnly === "true"
    });

    return res.json(closeReasons);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user;
    const { name, description, category, color, order, formId, whatsappId } = req.body;

    const closeReason = await CreateCloseReasonService({
        name,
        description,
        category,
        color,
        order,
        formId,
        tenantId,
        whatsappId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("closeReason", {
        action: "create",
        closeReason
    });

    return res.status(201).json(closeReason);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { closeReasonId } = req.params;
    const { tenantId } = req.user;

    const closeReason = await ShowCloseReasonService({
        closeReasonId: Number(closeReasonId),
        tenantId
    });

    return res.json(closeReason);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    const { closeReasonId } = req.params;
    const { tenantId } = req.user;
    const { name, description, category, color, isActive, order, formId } = req.body;

    const closeReason = await UpdateCloseReasonService({
        closeReasonId: Number(closeReasonId),
        tenantId,
        name,
        description,
        category,
        color,
        isActive,
        order,
        formId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("closeReason", {
        action: "update",
        closeReason
    });

    return res.json(closeReason);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    const { closeReasonId } = req.params;
    const { tenantId } = req.user;

    await DeleteCloseReasonService({
        closeReasonId: Number(closeReasonId),
        tenantId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("closeReason", {
        action: "delete",
        closeReasonId: Number(closeReasonId)
    });

    return res.status(200).json({ message: "Close reason deleted" });
};
