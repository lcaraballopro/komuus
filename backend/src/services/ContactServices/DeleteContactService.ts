import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

interface DeleteContactRequest {
  id: string;
  tenantId: number;
}

const DeleteContactService = async ({
  id,
  tenantId
}: DeleteContactRequest): Promise<void> => {
  const contact = await Contact.findOne({
    where: { id, tenantId }
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  await contact.destroy();
};

export default DeleteContactService;

