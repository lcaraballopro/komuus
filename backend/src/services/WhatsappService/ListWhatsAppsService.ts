import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

interface ListWhatsAppsRequest {
  tenantId: number;
}

const ListWhatsAppsService = async ({
  tenantId
}: ListWhatsAppsRequest): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
    where: { tenantId },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ]
  });

  return whatsapps;
};

export default ListWhatsAppsService;

