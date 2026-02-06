/**
 * N8nController - HTTP handlers for n8n webhook endpoints
 */

import { Request, Response } from "express";
import { handleN8nReply } from "../services/N8nService/N8nReplyService";
import { handleN8nEscalate, handleN8nReactivate } from "../services/N8nService/N8nEscalateService";
import { testAgentConnection } from "../services/N8nService/N8nWebhookService";
import {
    getBotState,
    setBotActive,
    getAllBotStates
} from "../services/BotStateService/BotStateService";
import SendDirectWhatsAppMessage from "../services/WbotServices/SendDirectWhatsAppMessage";
import Whatsapp from "../models/Whatsapp";

/**
 * POST /api/n8n/send-message
 * 
 * Send a WhatsApp message using a specific WhatsApp connection
 * Body: { whatsappId: number, number: string, message: string }
 */
export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
    const { whatsappId, number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({
            success: false,
            error: "number and message are required"
        });
    }

    // If no whatsappId, get default or first connected
    let targetWhatsappId = whatsappId;
    if (!targetWhatsappId) {
        const defaultWhatsapp = await Whatsapp.findOne({
            where: { status: "CONNECTED" },
            order: [["isDefault", "DESC"]]
        });
        if (!defaultWhatsapp) {
            return res.status(400).json({
                success: false,
                error: "No connected WhatsApp found"
            });
        }
        targetWhatsappId = defaultWhatsapp.id;
    }

    try {
        const result = await SendDirectWhatsAppMessage({
            whatsappId: targetWhatsappId,
            number,
            message
        });

        return res.status(200).json({
            success: true,
            whatsappId: targetWhatsappId,
            messageId: result.messageId,
            timestamp: result.timestamp
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message || "Failed to send message"
        });
    }
};

/**
 * GET /api/n8n/whatsapps
 * 
 * List available WhatsApp connections
 */
export const listWhatsapps = async (req: Request, res: Response): Promise<Response> => {
    const whatsapps = await Whatsapp.findAll({
        attributes: ["id", "name", "status", "isDefault"],
        order: [["isDefault", "DESC"], ["name", "ASC"]]
    });

    return res.status(200).json({
        whatsapps: whatsapps.map(w => ({
            id: w.id,
            name: w.name,
            status: w.status,
            isDefault: w.isDefault
        }))
    });
};

/**
 * POST /api/n8n/reply
 * 
 * Send a message to a customer from n8n
 * Body: { chatId: string, message: string }
 */
export const reply = async (req: Request, res: Response): Promise<Response> => {
    const { chatId, message } = req.body;

    const result = await handleN8nReply({ chatId, message });

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

/**
 * POST /api/n8n/escalate
 * 
 * Transfer conversation to human queue
 * Body: { chatId: string, queueId?: number, reason?: string }
 */
export const escalate = async (req: Request, res: Response): Promise<Response> => {
    const { chatId, queueId, reason } = req.body;

    const result = await handleN8nEscalate({ chatId, queueId, reason });

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

/**
 * POST /api/n8n/reactivate
 * 
 * Reactivate AI bot for a chat
 * Body: { chatId: string }
 */
export const reactivate = async (req: Request, res: Response): Promise<Response> => {
    const { chatId } = req.body;

    const result = await handleN8nReactivate(chatId);

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

/**
 * GET /api/n8n/bot-state/:chatId
 * 
 * Get the current bot state for a chat
 */
export const getBotStateHandler = async (req: Request, res: Response): Promise<Response> => {
    const { chatId } = req.params;

    if (!chatId) {
        return res.status(400).json({ error: "chatId is required" });
    }

    const state = await getBotState(chatId);

    return res.status(200).json({
        chatId,
        ...state
    });
};

/**
 * PUT /api/n8n/bot-state/:chatId
 * 
 * Set the bot state for a chat
 * Body: { active: boolean }
 */
export const setBotStateHandler = async (req: Request, res: Response): Promise<Response> => {
    const { chatId } = req.params;
    const { active } = req.body;

    if (!chatId) {
        return res.status(400).json({ error: "chatId is required" });
    }

    if (typeof active !== "boolean") {
        return res.status(400).json({ error: "active must be a boolean" });
    }

    await setBotActive(chatId, active);
    const state = await getBotState(chatId);

    return res.status(200).json({
        chatId,
        ...state
    });
};

/**
 * GET /api/n8n/status
 * 
 * Get n8n integration status and test connection
 */
export const status = async (req: Request, res: Response): Promise<Response> => {
    const botStates = getAllBotStates();

    return res.status(200).json({
        integration: "multi-agent",
        activeBotStates: botStates.size,
        serverTime: new Date().toISOString()
    });
};

/**
 * GET /api/n8n/health
 * 
 * Simple health check
 */
export const health = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
};

