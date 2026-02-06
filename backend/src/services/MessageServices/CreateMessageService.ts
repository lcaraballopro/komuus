import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { sendPushToUser } from "../WebPushService";
import { logger } from "../../utils/logger";

interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
}
interface Request {
  messageData: MessageData;
}

const CreateMessageService = async ({
  messageData
}: Request): Promise<Message> => {
  // Get the ticket to retrieve the tenantId
  const ticket = await Ticket.findByPk(messageData.ticketId);
  if (!ticket) {
    throw new Error("ERR_NO_TICKET_FOUND");
  }

  // Add tenantId to message data
  const messageWithTenant = {
    ...messageData,
    tenantId: ticket.tenantId
  };

  await Message.upsert(messageWithTenant);

  const message = await Message.findByPk(messageData.id, {
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        include: [
          "contact",
          "queue",
          {
            model: Whatsapp,
            as: "whatsapp",
            attributes: ["name"]
          }
        ]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new Error("ERR_CREATING_MESSAGE");
  }

  const io = getIO();
  const tenantId = message.ticket.tenantId;

  // Only emit appMessage notification if ticket is NOT being handled by bot
  // This prevents notifications to agents when bot is actively handling conversation
  logger.info(`CreateMessage: ticket ${message.ticketId} has status '${message.ticket.status}' - ${message.ticket.status === 'bot' ? 'skipping' : 'emitting'} notification`);
  if (message.ticket.status !== "bot") {
    io.to(`tenant:${tenantId}`).emit("appMessage", {
      action: "create",
      message,
      ticket: message.ticket,
      contact: message.ticket.contact
    });
  }

  // Send Web Push notification for incoming messages
  if (!message.fromMe && message.ticket.userId) {
    const pushBody = message.body.length > 100
      ? message.body.substring(0, 100) + "..."
      : message.body;

    sendPushToUser(message.ticket.userId, {
      title: `Mensaje de ${message.ticket.contact.name}`,
      body: pushBody,
      icon: message.ticket.contact.profilePicUrl,
      ticketId: message.ticketId
    }).catch(err => {
      logger.error(`Push notification error: ${err.message}`);
    });
  }

  return message;
};

export default CreateMessageService;
