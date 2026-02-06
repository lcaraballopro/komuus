import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import ShowTicketService from "./ShowTicketService";
import { getIO } from "../../libs/socket";
import { isBotActive } from "../BotStateService/BotStateService";
import { logger } from "../../utils/logger";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  groupContact?: Contact
): Promise<Ticket> => {
  // Get tenantId from the whatsapp connection
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  const tenantId = whatsapp?.tenantId;

  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      whatsappId: whatsappId,
      ...(tenantId && { tenantId })
    }
  });

  let isNewTicket = false;
  let ticketWasUpdated = false;

  if (ticket) {
    await ticket.update({ unreadMessages });
    ticketWasUpdated = true;
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        whatsappId: whatsappId,
        ...(tenantId && { tenantId })
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
      ticketWasUpdated = true;
    }
  }

  // If no open/pending ticket found for non-group contacts, create a new one
  // We no longer reopen closed tickets - each new conversation gets a fresh ticket

  if (!ticket) {
    // Check if bot is active for this contact
    const chatId = `${contact.number}@c.us`;
    const botIsActive = await isBotActive(chatId);

    // If bot is active, use "bot" status so it doesn't appear in "En espera"
    // If bot is inactive (escalated to human), use "pending" status
    const initialStatus = botIsActive ? "bot" : "pending";

    if (botIsActive) {
      logger.info(`Creating ticket with status 'bot' for ${chatId} - bot is handling`);
    }

    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: initialStatus,
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      tenantId
    });
    isNewTicket = true;
  }

  ticket = await ShowTicketService(ticket.id);

  // Emit socket event for new or updated tickets
  // Only emit if ticket is NOT being handled by bot (to avoid notifying agents)
  if ((isNewTicket || ticketWasUpdated) && ticket.status !== "bot") {
    const io = getIO();
    io.to(`tenant:${tenantId}`).emit("ticket", {
      action: "update",
      ticket
    });
  }

  return ticket;
};

export default FindOrCreateTicketService;

