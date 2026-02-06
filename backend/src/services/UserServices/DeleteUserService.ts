import User from "../../models/User";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import UpdateDeletedUserOpenTicketsStatus from "../../helpers/UpdateDeletedUserOpenTicketsStatus";

interface Request {
  id: string | number;
  tenantId: number | null;
}

const DeleteUserService = async ({ id, tenantId }: Request): Promise<void> => {
  // If tenantId is null (superadmin), find user by id only
  const whereClause: any = { id };
  if (tenantId !== null) {
    whereClause.tenantId = tenantId;
  }

  const user = await User.findOne({
    where: whereClause
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const userOpenTickets: Ticket[] = await user.$get("tickets", {
    where: { status: "open" }
  });

  if (userOpenTickets.length > 0) {
    UpdateDeletedUserOpenTicketsStatus(userOpenTickets);
  }

  await user.destroy();
};

export default DeleteUserService;
