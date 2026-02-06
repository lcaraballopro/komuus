import CloseReason from "../../models/CloseReason";
import AppError from "../../errors/AppError";

interface DeleteCloseReasonParams {
    closeReasonId: number;
    tenantId: number;
}

const DeleteCloseReasonService = async ({ closeReasonId, tenantId }: DeleteCloseReasonParams): Promise<void> => {
    const closeReason = await CloseReason.findOne({
        where: { id: closeReasonId, tenantId }
    });

    if (!closeReason) {
        throw new AppError("ERR_NO_CLOSE_REASON_FOUND", 404);
    }

    // Soft delete - just deactivate
    await closeReason.update({ isActive: false });
};

export default DeleteCloseReasonService;
