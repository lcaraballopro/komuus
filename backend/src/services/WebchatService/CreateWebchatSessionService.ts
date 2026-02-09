import { v4 as uuidv4 } from "uuid";
import WebchatSession from "../../models/WebchatSession";
import WebchatChannel from "../../models/WebchatChannel";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import AIAgent from "../../models/AIAgent";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { logger } from "../../utils/logger";

interface Request {
    channelId: number;
    visitorName?: string;
    visitorEmail?: string;
    visitorPhone?: string;
    ipAddress?: string;
    userAgent?: string;
    referrerUrl?: string;
}

interface Response {
    session: WebchatSession;
    channel: WebchatChannel;
}

const CreateWebchatSessionService = async ({
    channelId,
    visitorName,
    visitorEmail,
    visitorPhone,
    ipAddress,
    userAgent,
    referrerUrl
}: Request): Promise<Response> => {
    const channel = await WebchatChannel.findByPk(channelId, {
        include: [{ model: AIAgent, as: "aiAgent" }]
    });

    if (!channel) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_NOT_FOUND", 404);
    }

    if (!channel.isActive) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_INACTIVE", 400);
    }

    const sessionToken = uuidv4();
    const tenantId = channel.tenantId;

    // Create or find a Contact for this web visitor
    const contactName = visitorName || "Visitante Web";
    const contactNumber = `webchat-${sessionToken.slice(0, 12)}`;

    const contact = await Contact.create({
        name: contactName,
        number: contactNumber,
        email: visitorEmail || "",
        tenantId
    });

    logger.info(`Webchat: Created contact ${contact.id} for visitor`);

    // If channel has an active AI agent, isolate the ticket from human agents
    const hasActiveAI = !!(channel.aiAgent && channel.aiAgent.isActive);

    // Create a Ticket so the conversation appears in the agent inbox
    const ticket = await Ticket.create({
        contactId: contact.id,
        status: hasActiveAI ? "bot" : "pending",
        channel: "webchat",
        isGroup: false,
        unreadMessages: 0,
        tenantId,
        queueId: channel.queueId || undefined
    });

    logger.info(`Webchat: Created ticket ${ticket.id} for session ${sessionToken}`);

    // Create the webchat session linked to contact and ticket
    const session = await WebchatSession.create({
        channelId,
        sessionToken,
        visitorName: contactName,
        visitorEmail,
        visitorPhone,
        ipAddress,
        userAgent,
        referrerUrl,
        status: "active",
        contactId: contact.id,
        ticketId: ticket.id,
        lastActivityAt: new Date()
    });

    // Emit ticket event so agent inbox updates in real-time
    // Only emit if NOT handled by AI (bot-status tickets are hidden from agents)
    if (!hasActiveAI) {
        try {
            const fullTicket = await ShowTicketService(ticket.id);
            const io = getIO();
            io.to(`tenant:${tenantId}`).emit("ticket", {
                action: "update",
                ticket: fullTicket
            });
        } catch (err) {
            logger.error("Webchat: Failed to emit ticket event", err);
        }
    }

    return { session, channel };
};

export default CreateWebchatSessionService;
