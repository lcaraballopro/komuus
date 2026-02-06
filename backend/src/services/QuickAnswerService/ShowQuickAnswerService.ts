import QuickAnswer from "../../models/QuickAnswer";
import AppError from "../../errors/AppError";

interface Request {
  id: string;
  tenantId: number;
}

const ShowQuickAnswerService = async ({ id, tenantId }: Request): Promise<QuickAnswer> => {
  const quickAnswer = await QuickAnswer.findOne({
    where: { id, tenantId }
  });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWERS_FOUND", 404);
  }

  return quickAnswer;
};

export default ShowQuickAnswerService;
