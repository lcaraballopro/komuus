import WebchatSession from "../../models/WebchatSession";
import WebchatMessage from "../../models/WebchatMessage";
import WebchatChannel from "../../models/WebchatChannel";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import { triggerWebchatN8nWebhook } from "../N8nService/N8nWebhookService";

interface Request {
    sessionToken: string;
    body: string;
    sender: "visitor" | "agent" | "bot";
    agentId?: number;
}

interface Response {
    message: WebchatMessage;
}

const CreateWebchatMessageService = async ({
    sessionToken,
    body,
    sender,
    agentId
}: Request): Promise<Response> => {
    const session = await WebchatSession.findOne({
        where: { sessionToken },
        include: [{ model: WebchatChannel, as: "channel" }]
    });

    if (!session) {
        throw new AppError("ERR_WEBCHAT_SESSION_NOT_FOUND", 404);
    }

    if (session.status === "closed") {
        throw new AppError("ERR_WEBCHAT_SESSION_CLOSED", 410);
    }

    // Create webchat-specific message
    const message = await WebchatMessage.create({
        sessionId: session.id,
        body,
        sender,
        agentId: sender === "agent" ? agentId : undefined,
        isRead: sender !== "visitor"
    });

    // Update session last activity
    await session.update({ lastActivityAt: new Date() });

    // Sync to main Messages table so it appears in the agent chat UI
    if (session.ticketId) {
        try {
            const msgId = `webchat-${message.id}`;
            await Message.create({
                id: msgId,
                body,
                fromMe: sender !== "visitor",
                read: sender !== "visitor",
                ticketId: session.ticketId,
                contactId: session.contactId,
                tenantId: session.channel.tenantId
            });

            // Update ticket lastMessage and unread count
            const updateData: any = { lastMessage: body };
            if (sender === "visitor") {
                const ticket = await Ticket.findByPk(session.ticketId);
                if (ticket) {
                    updateData.unreadMessages = (ticket.unreadMessages || 0) + 1;
                }
            }
            await Ticket.update(updateData, {
                where: { id: session.ticketId }
            });

            // Re-fetch the full message with associations (same as CreateMessageService)
            const fullMessage = await Message.findByPk(msgId, {
                include: [
                    "contact",
                    {
                        model: Ticket,
                        as: "ticket",
                        include: ["contact", "queue"]
                    }
                ]
            });

            if (fullMessage) {
                const io = getIO();
                const tenantId = session.channel.tenantId;

                // Emit to tenant room (matches CreateMessageService pattern)
                io.to(`tenant:${tenantId}`).emit("appMessage", {
                    action: "create",
                    message: fullMessage,
                    ticket: fullMessage.ticket,
                    contact: fullMessage.ticket?.contact
                });

                // Also update ticket in inbox list
                io.to(`tenant:${tenantId}`).emit("ticket", {
                    action: "update",
                    ticket: fullMessage.ticket
                });
            }

            logger.info(`Webchat: Synced message ${msgId} to ticket ${session.ticketId}`);
        } catch (err) {
            logger.error("Webchat: Failed to sync message to Messages table", err);
        }
    }

    // Emit to socket for real-time widget updates
    const io = getIO();

    if (sender === "visitor") {
        // Notify agents in the tenant room
        io.to(`tenant:${session.channel.tenantId}`)
            .emit("webchat:newMessage", {
                sessionId: session.id,
                sessionToken,
                channelId: session.channelId,
                message: {
                    id: message.id,
                    body: message.body,
                    sender: message.sender,
                    createdAt: message.createdAt
                }
            });
    } else {
        // Notify the visitor via webchat namespace
        io.of("/webchat")
            .to(`session:${sessionToken}`)
            .emit("message", {
                id: message.id,
                body: message.body,
                sender: message.sender,
                createdAt: message.createdAt
            });
    }

    // Trigger AI agent webhook for visitor messages (fire-and-forget)
    if (sender === "visitor") {
        triggerWebchatN8nWebhook({
            sessionToken,
            sessionId: session.id,
            channelId: session.channelId,
            message: body,
            tenantId: session.channel.tenantId,
            ticketId: session.ticketId || undefined,
            contactId: session.contactId || undefined
        }).catch(err => logger.error("Webchat AI webhook error:", err));
    }

    return { message };
};

export default CreateWebchatMessageService;
