import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import TelephonyChannel from "../../models/TelephonyChannel";
import Queue from "../../models/Queue";
import CreateContactService from "../ContactServices/CreateContactService";
import { getIO } from "../../libs/socket";
import { v4 as uuidv4 } from "uuid";

interface Request {
    trunkUsername: string; // Identify channel by auth ID or other unique field
    from: string;    // CallerID
    to: string;      // DID called
    status?: string;
}

const ProcessIncomingCallService = async ({ trunkUsername, from, to }: Request): Promise<Ticket> => {
    // 1. Find Channel
    // We assume trunkUsername is unique per tenant or globally for the trunk provider account
    const channel = await TelephonyChannel.findOne({
        where: { trunkUsername },
        include: ["queue"]
    });

    if (!channel) {
        throw new Error("ERR_NO_CHANNEL_FOUND");
    }

    const tenantId = channel.tenantId;

    // 2. Format number (basic sanitization)
    const formattedNumber = from.replace(/\D/g, "");

    // 3. Find or Create Contact
    let contact = await Contact.findOne({
        where: { number: formattedNumber, tenantId }
    });

    if (!contact) {
        contact = await CreateContactService({
            name: formattedNumber,
            number: formattedNumber,
            tenantId,
            extraInfo: []
        });
    }

    // 4. Determine Queue
    // Priority: Channel Default Queue
    let queueId = channel.queueId || null;

    // 5. Find existing open ticket
    let ticket = await Ticket.findOne({
        where: {
            contactId: contact.id,
            tenantId,
            status: { [Op.or]: ["open", "pending"] }
        },
        include: ["contact", "queue", "user"] // Include associations for return
    });

    if (ticket) {
        // If ticket exists, we might want to update it or just return it
        // For now, return existing ticket to avoid duplicates
        return ticket;
    }

    // 6. Create new Ticket
    ticket = await Ticket.create({
        contactId: contact.id,
        status: "pending",
        isGroup: false,
        userId: null,
        tenantId,
        queueId,
        channel: "telephony",
        telephonyId: channel.id,
        lastMessage: `📞 Llamada entrante de ${formattedNumber} (a ${to})`,
        unreadMessages: 1
    });

    // 7. Create Call Log Message
    await Message.create({
        id: uuidv4(),
        ticketId: ticket.id,
        contactId: contact.id,
        body: `📞 Llamada entrante de ${formattedNumber}`,
        fromMe: false,
        read: true,
        mediaType: "chat",
        tenantId
    });

    // 8. Reload with associations
    await ticket.reload({
        include: [
            { model: Contact, as: "contact" },
            { model: TelephonyChannel, as: "telephony" },
            { model: Queue, as: "queue" }
        ]
    });

    // 8. Emit socket event
    const io = getIO();
    io.to(`tenant-${tenantId}-notification`).emit("appMessage", {
        action: "create",
        ticket
    });

    // Also emit to specific queue room if needed? 
    // Usually 'appMessage' is enough for the frontend to pick it up.

    return ticket;
};

export default ProcessIncomingCallService;
