/**
 * N8nEscalateService - Handles escalation requests from n8n
 * 
 * Deactivates bot for the chat and transfers ticket to human queue.
 */

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";
import { deactivateBot, normalizeChatId } from "../BotStateService/BotStateService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { findTicketByChatId } from "./N8nReplyService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { v4 as uuidv4 } from "uuid";

interface EscalateRequest {
    chatId: string;     // "573001234567@c.us" or just "573001234567"
    queueId?: number;   // Optional: specific queue to transfer to
    reason?: string;    // Optional: reason for escalation
    aiSummary?: string; // Optional: AI-generated summary of conversation from n8n
}

interface EscalateResponse {
    success: boolean;
    ticketId?: number;
    queueName?: string;
    error?: string;
}

/**
 * Handle escalation request from n8n
 * 
 * 1. Deactivate bot for this chat
 * 2. Update ticket status to pending
 * 3. Optionally assign to specific queue
 */
const handleN8nEscalate = async (request: EscalateRequest): Promise<EscalateResponse> => {
    const { chatId, queueId, reason } = request;

    if (!chatId) {
        return {
            success: false,
            error: "chatId is required"
        };
    }

    try {
        // 1. Deactivate bot for this chat
        await deactivateBot(chatId, reason);

        // 2. Find the active ticket
        const ticket = await findTicketByChatId(chatId);

        if (!ticket) {
            return {
                success: false,
                error: `No open ticket found for chatId: ${chatId}`
            };
        }

        // 3. Prepare ticket update
        const ticketData: any = {
            status: "pending",
            userId: null  // Unassign from any user (goes to queue)
        };

        // 4. Assign to queue if specified
        let queueName: string | undefined;

        if (queueId) {
            const queue = await Queue.findByPk(queueId);
            if (queue) {
                ticketData.queueId = queueId;
                queueName = queue.name;
            }
        } else {
            // If no queue specified, use default queue (first available)
            const defaultQueue = await Queue.findOne({
                order: [["id", "ASC"]]
            });

            if (defaultQueue && !ticket.queueId) {
                ticketData.queueId = defaultQueue.id;
                queueName = defaultQueue.name;
            }
        }

        // 5. Send transfer message to customer
        const transferMessage = "🔄 *Te estamos transfiriendo con uno de nuestros asesores.* Por favor espera un momento, pronto serás atendido.";

        try {
            await SendWhatsAppMessage({
                body: transferMessage,
                ticket
            });
            logger.info(`Transfer message sent to ${chatId}`);
        } catch (msgError: any) {
            logger.warn(`Failed to send transfer message: ${msgError.message}`);
            // Continue with escalation even if message fails
        }

        // 6. Update ticket
        await UpdateTicketService({
            ticketId: ticket.id,
            ticketData
        });

        // 7. Create system message with AI summary for agent
        try {
            let systemMessage: string;

            if (request.aiSummary) {
                // Use AI-generated summary from n8n
                systemMessage =
                    `📋 *RESUMEN DE CONVERSACIÓN (IA)*
━━━━━━━━━━━━━━━━━━━━━━━━
${request.aiSummary}
━━━━━━━━━━━━━━━━━━━━━━━━
*Motivo de escalación:* ${reason || 'Cliente solicitó hablar con un asesor'}`;
            } else {
                // Fallback: Basic message list if no AI summary
                const recentMessages = await Message.findAll({
                    where: { ticketId: ticket.id },
                    order: [["createdAt", "DESC"]],
                    limit: 5,
                    include: [{ model: Contact, as: "contact" }]
                });

                let summaryLines: string[] = [];
                recentMessages.reverse().forEach(msg => {
                    const sender = msg.fromMe ? "🤖 Bot" : `👤 ${ticket.contact?.name || 'Cliente'}`;
                    const text = msg.body.length > 80 ? msg.body.substring(0, 80) + "..." : msg.body;
                    summaryLines.push(`${sender}: ${text}`);
                });

                systemMessage =
                    `📋 *HISTORIAL RECIENTE*
━━━━━━━━━━━━━━━━━━━━━━━━
${summaryLines.join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━
*Motivo de escalación:* ${reason || 'Cliente solicitó hablar con un asesor'}`;
            }

            // Create internal system message (not sent to WhatsApp, only visible to agent)
            await CreateMessageService({
                messageData: {
                    id: uuidv4(),
                    ticketId: ticket.id,
                    body: systemMessage,
                    fromMe: true,
                    read: false,
                    mediaType: "system"
                }
            });

            logger.info(`System summary message created for ticket ${ticket.id}`);
        } catch (summaryError: any) {
            logger.warn(`Failed to create summary message: ${summaryError.message}`);
        }

        logger.info(`n8n escalation: ${chatId} -> queue "${queueName || 'default'}" (ticket ${ticket.id}), reason: ${reason || 'not specified'}`);

        return {
            success: true,
            ticketId: ticket.id,
            queueName
        };

    } catch (error: any) {
        logger.error(`n8n escalation error for ${chatId}: ${error.message}`);
        return {
            success: false,
            error: error.message || "Failed to escalate"
        };
    }
};

/**
 * Reactivate bot for a chat (resume AI handling)
 */
const handleN8nReactivate = async (chatId: string): Promise<EscalateResponse> => {
    if (!chatId) {
        return { success: false, error: "chatId is required" };
    }

    try {
        const { activateBot } = await import("../BotStateService/BotStateService");
        await activateBot(chatId);

        const ticket = await findTicketByChatId(chatId);

        logger.info(`n8n bot reactivated for ${chatId}`);

        return {
            success: true,
            ticketId: ticket?.id
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
};

export {
    handleN8nEscalate,
    handleN8nReactivate,
    EscalateRequest,
    EscalateResponse
};
