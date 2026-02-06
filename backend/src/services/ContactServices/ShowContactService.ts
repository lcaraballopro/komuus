import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

interface ShowContactRequest {
  id: string | number;
  tenantId?: number;
}

const ShowContactService = async (
  idOrRequest: string | number | ShowContactRequest
): Promise<Contact> => {
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

  const contact = await Contact.findOne({
    where: whereClause,
    include: ["extraInfo"]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contact;
};

export default ShowContactService;

