import CloseReason from "../../models/CloseReason";
import AppError from "../../errors/AppError";

interface UpdateCloseReasonData {
    closeReasonId: number;
    tenantId: number;
    name?: string;
    description?: string;
    category?: "positive" | "negative";
    color?: string;
    isActive?: boolean;
    order?: number;
    formId?: number | null;
}

const UpdateCloseReasonService = async (data: UpdateCloseReasonData): Promise<CloseReason> => {
    const { closeReasonId, tenantId, ...updateData } = data;

    const closeReason = await CloseReason.findOne({
        where: { id: closeReasonId, tenantId }
    });

    if (!closeReason) {
        throw new AppError("ERR_NO_CLOSE_REASON_FOUND", 404);
    }

    await closeReason.update(updateData);
    await closeReason.reload();

    return closeReason;
};

export default UpdateCloseReasonService;
