import { Request, Response } from "express";
import CreateWebchatChannelService from "../services/WebchatService/CreateWebchatChannelService";
import ListWebchatChannelsService from "../services/WebchatService/ListWebchatChannelsService";
import ShowWebchatChannelService from "../services/WebchatService/ShowWebchatChannelService";
import UpdateWebchatChannelService from "../services/WebchatService/UpdateWebchatChannelService";
import DeleteWebchatChannelService from "../services/WebchatService/DeleteWebchatChannelService";
import GenerateWidgetScriptService from "../services/WebchatService/GenerateWidgetScriptService";

interface WebchatChannelData {
    name: string;
    primaryColor?: string;
    position?: string;
    welcomeMessage?: string;
    offlineMessage?: string;
    avatarUrl?: string;
    buttonText?: string;
    allowedDomains?: string[];
    aiAgentId?: number;
    queueId?: number;
    isActive?: boolean;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
    const {
        name,
        primaryColor,
        position,
        welcomeMessage,
        offlineMessage,
        avatarUrl,
        buttonText,
        allowedDomains,
        aiAgentId,
        queueId
    }: WebchatChannelData = req.body;

    const tenantId = req.user.tenantId;

    const { channel } = await CreateWebchatChannelService({
        name,
        primaryColor,
        position,
        welcomeMessage,
        offlineMessage,
        avatarUrl,
        buttonText,
        allowedDomains,
        aiAgentId,
        queueId,
        tenantId
    });

    return res.status(201).json(channel);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
    const tenantId = req.user.tenantId;

    const channels = await ListWebchatChannelsService({ tenantId });

    return res.status(200).json(channels);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { channelId } = req.params;
    const tenantId = req.user.tenantId;

    const channel = await ShowWebchatChannelService({
        id: Number(channelId),
        tenantId
    });

    return res.status(200).json(channel);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    const { channelId } = req.params;
    const tenantId = req.user.tenantId;
    const {
        name,
        isActive,
        primaryColor,
        position,
        welcomeMessage,
        offlineMessage,
        avatarUrl,
        buttonText,
        allowedDomains,
        aiAgentId,
        queueId
    }: WebchatChannelData = req.body;

    const channel = await UpdateWebchatChannelService({
        id: Number(channelId),
        name,
        isActive,
        primaryColor,
        position,
        welcomeMessage,
        offlineMessage,
        avatarUrl,
        buttonText,
        allowedDomains,
        aiAgentId,
        queueId,
        tenantId
    });

    return res.status(200).json(channel);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
    const { channelId } = req.params;
    const tenantId = req.user.tenantId;

    await DeleteWebchatChannelService({
        id: Number(channelId),
        tenantId
    });

    return res.status(200).json({ message: "Webchat channel deleted." });
};

export const getScript = async (req: Request, res: Response): Promise<Response> => {
    const { channelId } = req.params;
    const tenantId = req.user.tenantId;

    // Get base URL from request
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const baseUrl = `${protocol}://${host}`;

    const { embedCode, scriptUrl } = await GenerateWidgetScriptService({
        id: Number(channelId),
        tenantId,
        baseUrl
    });

    return res.status(200).json({ embedCode, scriptUrl });
};
