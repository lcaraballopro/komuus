import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateAIAgentService from "../services/AIAgentService/CreateAIAgentService";
import ListAIAgentsService from "../services/AIAgentService/ListAIAgentsService";
import ShowAIAgentService from "../services/AIAgentService/ShowAIAgentService";
import UpdateAIAgentService from "../services/AIAgentService/UpdateAIAgentService";
import DeleteAIAgentService from "../services/AIAgentService/DeleteAIAgentService";

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { searchParam } = req.query as { searchParam?: string };
    const { tenantId } = req.user;

    const { agents, count } = await ListAIAgentsService({ searchParam, tenantId });

    return res.json({ agents, count });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { name, webhookUrl, apiToken, isActive } = req.body;
    const { tenantId } = req.user;

    const agent = await CreateAIAgentService({
        name,
        webhookUrl,
        apiToken,
        isActive,
        tenantId
    });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("aiAgent", {
        action: "create",
        agent
    });

    return res.status(200).json(agent);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { agentId } = req.params;
    const { tenantId } = req.user;

    const agent = await ShowAIAgentService({ id: agentId, tenantId });

    return res.status(200).json(agent);
};

export const update = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { agentId } = req.params;
    const agentData = req.body;
    const { tenantId } = req.user;

    const agent = await UpdateAIAgentService({ agentData, agentId, tenantId });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("aiAgent", {
        action: "update",
        agent
    });

    return res.status(200).json(agent);
};

export const remove = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { agentId } = req.params;
    const { tenantId } = req.user;

    await DeleteAIAgentService({ id: agentId, tenantId });

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("aiAgent", {
        action: "delete",
        agentId
    });

    return res.status(200).json({ message: "AI Agent deleted" });
};
