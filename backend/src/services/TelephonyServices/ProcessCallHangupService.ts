import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import TelephonyChannel from "../../models/TelephonyChannel";
import { getIO } from "../../libs/socket";
import { v4 as uuidv4 } from "uuid";

interface Request {
    trunkUsername: string;
    from: string;
    to: string;
    duration?: number; // Seconds
    recordingUrl?: string;
}

const ProcessCallHangupService = async ({ trunkUsername, from, to, duration, recordingUrl }: Request): Promise<Ticket | null> => {
    // 1. Find Channel
    const channel = await TelephonyChannel.findOne({
        where: { trunkUsername }
    });

    if (!channel) {
        throw new Error("ERR_NO_CHANNEL_FOUND");
    }

    const tenantId = channel.tenantId;

    // 2. Find Contact
    const formattedNumber = from.replace(/\D/g, "");
    const contact = await Contact.findOne({
        where: { number: formattedNumber, tenantId }
    });

    if (!contact) {
        // If contact doesn't exist, we probably didn't process the incoming call start?
        // Or maybe it was an outbound call?
        // For simplicity, we skip if contact not found, or create it?
        // Let's safe return null
        return null;
    }

    // 3. Find Ticket (Open)
    const ticket = await Ticket.findOne({
        where: {
            contactId: contact.id,
            tenantId,
            status: { [Op.or]: ["open", "pending"] }
        },
        include: ["contact"]
    });

    if (!ticket) {
        return null;
    }

    // 4. Create "Call Ended" Message
    const durationText = duration ? `${Math.floor(duration / 60)}m ${duration % 60}s` : "N/A";

    await Message.create({
        id: uuidv4(),
        ticketId: ticket.id,
        contactId: contact.id,
        body: `📵 Llamada finalizada. Duración: ${durationText}`,
        fromMe: false,
        read: true,
        mediaType: "chat",
        tenantId
    });

    // 5. If recording exists, create Audio Message
    if (recordingUrl) {
        await Message.create({
            id: uuidv4(),
            ticketId: ticket.id,
            contactId: contact.id,
            body: "",
            mediaUrl: recordingUrl,
            mediaType: "audio",
            fromMe: false,
            read: true,
            tenantId
        });
    }

    // 6. Emit update
    const io = getIO();
    io.to(`tenant-${tenantId}-notification`).emit("appMessage", {
        action: "update",
        ticket
    });

    return ticket;
};

export default ProcessCallHangupService;
