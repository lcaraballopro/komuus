import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import ShowTicketService from "./ShowTicketService";
import { activateBot } from "../BotStateService/BotStateService";
import { logger } from "../../utils/logger";

interface TicketData {
  status?: string;
  userId?: number;
  queueId?: number;
  whatsappId?: number;
  closeReasonId?: number;
  closedBy?: number;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId
}: Request): Promise<Response> => {
  const { status, userId, queueId, whatsappId, closeReasonId, closedBy } = ticketData;

  const ticket = await ShowTicketService(ticketId);
  await SetTicketMessagesAsRead(ticket);

  if (whatsappId && ticket.whatsappId !== whatsappId) {
    await CheckContactOpenTickets(ticket.contactId, whatsappId);
  }

  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;

  if (oldStatus === "closed") {
    await CheckContactOpenTickets(ticket.contact.id, ticket.whatsappId);
  }

  // Prepare update data
  const updateData: any = {
    status,
    queueId,
    userId
  };

  // If closing ticket, set close reason and timestamp
  if (status === "closed" && oldStatus !== "closed") {
    updateData.closeReasonId = closeReasonId;
    updateData.closedAt = new Date();
    updateData.closedBy = closedBy || userId;
  }

  // If reopening ticket, clear close reason data
  if (status !== "closed" && oldStatus === "closed") {
    updateData.closeReasonId = null;
    updateData.closedAt = null;
    updateData.closedBy = null;
  }

  await ticket.update(updateData);

  if (whatsappId) {
    await ticket.update({
      whatsappId
    });
  }

  await ticket.reload();

  const io = getIO();
  const tenantId = ticket.tenantId;

  if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
    io.to(`tenant:${tenantId}`).emit("ticket", {
      action: "delete",
      ticketId: ticket.id
    });
  }

  io.to(`tenant:${tenantId}`).emit("ticket", {
    action: "update",
    ticket
  });

  // Reactivate bot when ticket is closed/resolved
  // This allows the customer to interact with the chatbot again in future conversations
  if (status === "closed" && oldStatus !== "closed") {
    try {
      const chatId = `${ticket.contact.number}@c.us`;
      await activateBot(chatId);
      logger.info(`Bot reactivated for ${chatId} after ticket ${ticket.id} was closed`);
    } catch (err: any) {
      logger.error(`Failed to reactivate bot after closing ticket ${ticket.id}: ${err.message}`);
    }
  }

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;


