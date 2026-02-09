/**
 * N8nController - HTTP handlers for n8n webhook endpoints
 */

import { Request, Response } from "express";
import { handleN8nReply } from "../services/N8nService/N8nReplyService";
import { handleN8nEscalate, handleN8nReactivate } from "../services/N8nService/N8nEscalateService";
import { testAgentConnection } from "../services/N8nService/N8nWebhookService";
import { handleWebchatN8nReply } from "../services/N8nService/WebchatN8nReplyService";
import { handleWebchatN8nEscalate } from "../services/N8nService/WebchatN8nEscalateService";
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

/**
 * POST /api/n8n/reservations
 * 
 * Create a reservation from n8n (AI Agent)
 * Body: { ticketId: number, title: string, startDate: string, endDate: string, description?: string, notes?: string }
 */
export const createReservation = async (req: Request, res: Response): Promise<Response> => {
    const { ticketId, title, startDate, endDate, description, notes } = req.body;

    if (!ticketId || !title || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields: ticketId, title, startDate, endDate" });
    }

    try {
        // Find ticket to get context (tenantId, contactId)
        const Ticket = (await import("../models/Ticket")).default;
        const ticket = await Ticket.findByPk(ticketId);

        if (!ticket) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        const CreateReservationService = (await import("../services/ReservationService/CreateReservationService")).default;

        const reservation = await CreateReservationService({
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: "pending",
            notes: notes || `Created via AI Agent (Ticket #${ticketId})`,
            contactId: ticket.contactId,
            userId: ticket.userId, // Assign to current ticket owner
            ticketId: ticket.id,
            tenantId: ticket.tenantId
        });

        return res.status(201).json(reservation);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message || "Failed to create reservation" });
    }
};

/**
 * POST /api/n8n/webchat-reply
 *
 * Send a reply to a webchat visitor from n8n
 * Body: { sessionToken: string, message: string }
 */
export const webchatReply = async (req: Request, res: Response): Promise<Response> => {
    const { sessionToken, message } = req.body;

    const result = await handleWebchatN8nReply({ sessionToken, message });

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

/**
 * POST /api/n8n/webchat-escalate
 *
 * Transfer a webchat conversation to a human agent queue
 * Body: { sessionToken: string, queueId?: number, reason?: string, aiSummary?: string }
 */
export const webchatEscalate = async (req: Request, res: Response): Promise<Response> => {
    const { sessionToken, queueId, reason, aiSummary } = req.body;

    const result = await handleWebchatN8nEscalate({ sessionToken, queueId, reason, aiSummary });

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

