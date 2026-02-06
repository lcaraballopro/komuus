import { Request, Response } from "express";
import CreateWebchatSessionService from "../services/WebchatService/CreateWebchatSessionService";
import GetWebchatSessionService from "../services/WebchatService/GetWebchatSessionService";
import CreateWebchatMessageService from "../services/WebchatService/CreateWebchatMessageService";
import WebchatChannel from "../models/WebchatChannel";
import AppError from "../errors/AppError";

// Get channel config (public - for widget initialization)
export const getChannelConfig = async (req: Request, res: Response): Promise<Response> => {
    const { channelId } = req.params;

    const channel = await WebchatChannel.findByPk(channelId, {
        attributes: [
            "id",
            "name",
            "isActive",
            "primaryColor",
            "position",
            "welcomeMessage",
            "offlineMessage",
            "avatarUrl",
            "buttonText"
        ]
    });

    if (!channel) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_NOT_FOUND", 404);
    }

    if (!channel.isActive) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_INACTIVE", 400);
    }

    return res.status(200).json(channel);
};

// Create new session (public - when visitor opens chat)
export const createSession = async (req: Request, res: Response): Promise<Response> => {
    const { channelId } = req.params;
    const { visitorName, visitorEmail, visitorPhone, referrerUrl } = req.body;

    // Get visitor info from request
    const ipAddress = req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    const { session, channel } = await CreateWebchatSessionService({
        channelId: Number(channelId),
        visitorName,
        visitorEmail,
        visitorPhone,
        ipAddress,
        userAgent,
        referrerUrl
    });

    return res.status(201).json({
        sessionToken: session.sessionToken,
        welcomeMessage: channel.welcomeMessage,
        config: {
            primaryColor: channel.primaryColor,
            position: channel.position,
            avatarUrl: channel.avatarUrl,
            buttonText: channel.buttonText
        }
    });
};

// Get session with messages (public - for reconnection/history)
export const getSession = async (req: Request, res: Response): Promise<Response> => {
    const { sessionToken } = req.params;

    const { session, messages, channel } = await GetWebchatSessionService({
        sessionToken
    });

    return res.status(200).json({
        session: {
            id: session.id,
            status: session.status,
            visitorName: session.visitorName
        },
        messages: messages.map(m => ({
            id: m.id,
            body: m.body,
            sender: m.sender,
            createdAt: m.createdAt
        })),
        config: {
            primaryColor: channel.primaryColor,
            position: channel.position,
            avatarUrl: channel.avatarUrl
        }
    });
};

// Send message (public - from visitor)
export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
    const { sessionToken, body } = req.body;

    if (!sessionToken || !body) {
        throw new AppError("ERR_MISSING_PARAMETERS", 400);
    }

    const { message } = await CreateWebchatMessageService({
        sessionToken,
        body,
        sender: "visitor"
    });

    return res.status(201).json({
        id: message.id,
        body: message.body,
        sender: message.sender,
        createdAt: message.createdAt
    });
};
