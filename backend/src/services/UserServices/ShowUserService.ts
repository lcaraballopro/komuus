import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

const ShowUserService = async (
  id: string | number,
  tenantId?: number
): Promise<User> => {
  const whereClause: { id: string | number; tenantId?: number } = { id };

  // If tenantId is provided, also filter by tenant (security)
  if (tenantId) {
    whereClause.tenantId = tenantId;
  }

  const user = await User.findOne({
    where: whereClause,
    attributes: [
      "name",
      "id",
      "email",
      "profile",
      "tokenVersion",
      "whatsappId",
      "tenantId"
    ],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
    ],
    order: [[{ model: Queue, as: "queues" }, "name", "asc"]]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default ShowUserService;
