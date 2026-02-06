import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

interface DeleteWhatsAppRequest {
  id: string;
  tenantId: number;
}

const DeleteWhatsAppService = async ({
  id,
  tenantId
}: DeleteWhatsAppRequest): Promise<void> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id, tenantId }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await whatsapp.destroy();
};

export default DeleteWhatsAppService;

