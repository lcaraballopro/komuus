/**
 * WebchatN8nEscalateService - Handles escalation requests from n8n for webchat sessions
 *
 * Deactivates the bot, transitions the ticket to "pending" so it appears
 * in the human agent inbox, and optionally creates a system summary message.
 */

import WebchatSession from "../../models/WebchatSession";
import WebchatChannel from "../../models/WebchatChannel";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import { deactivateBot } from "../BotStateService/BotStateService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import CreateWebchatMessageService from "../WebchatService/CreateWebchatMessageService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "../../libs/socket";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface WebchatEscalateRequest {
    sessionToken: string;
    queueId?: number;
    reason?: string;
    aiSummary?: string;
}

interface WebchatEscalateResponse {
    success: boolean;
    ticketId?: number;
    queueName?: string;
    error?: string;
}

/**
 * Handle webchat escalation from n8n to human agent
 */
const handleWebchatN8nEscalate = async (
    request: WebchatEscalateRequest
): Promise<WebchatEscalateResponse> => {
    const { sessionToken, queueId, reason } = request;

    if (!sessionToken) {
        return { success: false, error: "sessionToken is required" };
    }

    try {
        // 1. Deactivate bot for this webchat session
        const botChatId = `webchat-${sessionToken}`;
        await deactivateBot(botChatId, reason);

        // 2. Find the session and its ticket
        const session = await WebchatSession.findOne({
            where: { sessionToken },
            include: [{ model: WebchatChannel, as: "channel" }]
        });

        if (!session || !session.ticketId) {
            return {
                success: false,
                error: `No webchat session or ticket found for token: ${sessionToken}`
            };
        }

        const ticketId = session.ticketId;
        const tenantId = session.channel.tenantId;

        // 3. Prepare ticket update
        const ticketData: any = {
            status: "pending",
            userId: null // Unassign (goes to queue)
        };

        // 4. Assign to queue if specified
        let queueName: string | undefined;

        if (queueId) {
            const queue = await Queue.findByPk(queueId);
            if (queue) {
                ticketData.queueId = queueId;
                queueName = queue.name;
            }
        } else if (session.channel.queueId) {
            // Use channel's default queue
            const queue = await Queue.findByPk(session.channel.queueId);
            if (queue) {
                ticketData.queueId = queue.id;
                queueName = queue.name;
            }
        }

        // 5. Send transfer message to visitor via webchat
        try {
            await CreateWebchatMessageService({
                sessionToken,
                body: "🔄 *Te estamos transfiriendo con uno de nuestros asesores.* Por favor espera un momento, pronto serás atendido.",
                sender: "bot"
            });
        } catch (msgError: any) {
            logger.warn(`Failed to send transfer message to webchat: ${msgError.message}`);
        }

        // 6. Update ticket status to pending
        await UpdateTicketService({ ticketId, ticketData });

        // 7. Create system message with AI summary for agent
        try {
            let systemMessage: string;

            if (request.aiSummary) {
                systemMessage = `📋 *RESUMEN DE CONVERSACIÓN (IA)*
━━━━━━━━━━━━━━━━━━━━━━━━
${request.aiSummary}
━━━━━━━━━━━━━━━━━━━━━━━━
*Motivo de escalación:* ${reason || "Cliente solicitó hablar con un asesor"}`;
            } else {
                // Fallback: fetch last 5 messages
                const recentMessages = await Message.findAll({
                    where: { ticketId },
                    order: [["createdAt", "DESC"]],
                    limit: 5,
                    include: [{ model: Contact, as: "contact" }]
                });

                const summaryLines: string[] = [];
                const ticket = await Ticket.findByPk(ticketId, {
                    include: [{ model: Contact, as: "contact" }]
                });

                recentMessages.reverse().forEach(msg => {
                    const sender = msg.fromMe
                        ? "🤖 Bot"
                        : `👤 ${ticket?.contact?.name || "Cliente"}`;
                    const text =
                        msg.body.length > 80
                            ? msg.body.substring(0, 80) + "..."
                            : msg.body;
                    summaryLines.push(`${sender}: ${text}`);
                });

                systemMessage = `📋 *HISTORIAL RECIENTE*
━━━━━━━━━━━━━━━━━━━━━━━━
${summaryLines.join("\n")}
━━━━━━━━━━━━━━━━━━━━━━━━
*Motivo de escalación:* ${reason || "Cliente solicitó hablar con un asesor"}`;
            }

            await CreateMessageService({
                messageData: {
                    id: uuidv4(),
                    ticketId,
                    body: systemMessage,
                    fromMe: true,
                    read: false,
                    mediaType: "system"
                }
            });

            logger.info(`System summary message created for webchat ticket ${ticketId}`);
        } catch (summaryError: any) {
            logger.warn(`Failed to create summary message: ${summaryError.message}`);
        }

        // 8. Emit ticket event to notify agents
        try {
            const fullTicket = await ShowTicketService(ticketId);
            const io = getIO();
            io.to(`tenant:${tenantId}`).emit("ticket", {
                action: "update",
                ticket: fullTicket
            });
        } catch (emitErr: any) {
            logger.warn(`Failed to emit ticket update: ${emitErr.message}`);
        }

        logger.info(
            `Webchat n8n escalation: session ${sessionToken} -> queue "${queueName || "default"}" (ticket ${ticketId}), reason: ${reason || "not specified"}`
        );

        return {
            success: true,
            ticketId,
            queueName
        };
    } catch (error: any) {
        logger.error(
            `Webchat n8n escalation error for ${sessionToken}: ${error.message}`
        );
        return {
            success: false,
            error: error.message || "Failed to escalate webchat"
        };
    }
};

export {
    handleWebchatN8nEscalate,
    WebchatEscalateRequest,
    WebchatEscalateResponse
};
