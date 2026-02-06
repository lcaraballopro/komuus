import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

interface ShowTicketRequest {
  id: string | number;
  tenantId?: number;
}

const ShowTicketService = async (
  idOrRequest: string | number | ShowTicketRequest
): Promise<Ticket> => {
  let id: string | number;
  let tenantId: number | undefined;

  // Support both old signature (just id) and new signature (object with id and tenantId)
  if (typeof idOrRequest === "object" && idOrRequest !== null) {
    id = idOrRequest.id;
    tenantId = idOrRequest.tenantId;
  } else {
    id = idOrRequest;
  }

  const whereClause: any = { id };
  if (tenantId !== undefined) {
    whereClause.tenantId = tenantId;
  }

  const ticket = await Ticket.findOne({
    where: whereClause,
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"],
        include: ["extraInfo"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name"]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return ticket;
};

export default ShowTicketService;

