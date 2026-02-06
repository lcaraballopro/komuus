import AppError from "../../errors/AppError";
import QuickAnswer from "../../models/QuickAnswer";

interface Request {
  shortcut: string;
  message: string;
  tenantId: number;
}

const CreateQuickAnswerService = async ({
  shortcut,
  message,
  tenantId
}: Request): Promise<QuickAnswer> => {
  // Check if shortcut already exists for this tenant
  const nameExists = await QuickAnswer.findOne({
    where: { shortcut, tenantId }
  });

  if (nameExists) {
    throw new AppError("ERR__SHORTCUT_DUPLICATED");
  }

  const quickAnswer = await QuickAnswer.create({ shortcut, message, tenantId });

  return quickAnswer;
};

export default CreateQuickAnswerService;
