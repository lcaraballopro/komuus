import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

interface ShowWhatsAppRequest {
  id: string | number;
  tenantId?: number;
}

const ShowWhatsAppService = async (
  idOrRequest: string | number | ShowWhatsAppRequest
): Promise<Whatsapp> => {
  let id: string | number;
  let tenantId: number | undefined;

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

  const whatsapp = await Whatsapp.findOne({
    where: whereClause,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ],
    order: [["queues", "name", "ASC"]]
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppService;

