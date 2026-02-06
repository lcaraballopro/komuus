/**
 * N8nReplyService - Handles reply messages from n8n
 * 
 * Finds the open ticket for a chatId and sends a message via WhatsApp.
 */

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import { normalizeChatId } from "../BotStateService/BotStateService";

interface ReplyRequest {
    chatId: string;    // "573001234567@c.us" or just "573001234567"
    message: string;   // Text message to send
}

interface ReplyResponse {
    success: boolean;
    ticketId?: number;
    error?: string;
}

/**
 * Find the most recent open ticket for a chatId
 */
const findTicketByChatId = async (chatId: string): Promise<Ticket | null> => {
    const phoneNumber = normalizeChatId(chatId);

    // Find contact by phone number
    const contact = await Contact.findOne({
        where: { number: phoneNumber }
    });

    if (!contact) {
        logger.warn(`No contact found for chatId: ${chatId}`);
        return null;
    }

    // Find the most recent open/pending/bot ticket for this contact
    const ticket = await Ticket.findOne({
        where: {
            contactId: contact.id,
            status: ["open", "pending", "bot"]
        },
        order: [["updatedAt", "DESC"]],
        include: [
            { model: Contact, as: "contact" },
            { model: Whatsapp, as: "whatsapp" }
        ]
    });

    return ticket;
};

/**
 * Send a reply message to a customer via n8n
 */
const handleN8nReply = async (request: ReplyRequest): Promise<ReplyResponse> => {
    const { chatId, message } = request;

    if (!chatId || !message) {
        return {
            success: false,
            error: "chatId and message are required"
        };
    }

    try {
        // Find the active ticket for this chat
        const ticket = await findTicketByChatId(chatId);

        if (!ticket) {
            return {
                success: false,
                error: `No open ticket found for chatId: ${chatId}`
            };
        }

        // Send message via WhatsApp
        await SendWhatsAppMessage({
            body: message,
            ticket
        });

        logger.info(`n8n reply sent to ${chatId} (ticket ${ticket.id})`);

        return {
            success: true,
            ticketId: ticket.id
        };

    } catch (error: any) {
        logger.error(`n8n reply error for ${chatId}: ${error.message}`);
        return {
            success: false,
            error: error.message || "Failed to send message"
        };
    }
};

export {
    handleN8nReply,
    findTicketByChatId,
    ReplyRequest,
    ReplyResponse
};
