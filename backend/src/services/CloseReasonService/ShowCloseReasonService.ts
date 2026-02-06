import CloseReason from "../../models/CloseReason";
import AppError from "../../errors/AppError";

interface ShowCloseReasonParams {
    closeReasonId: number;
    tenantId: number;
}

const ShowCloseReasonService = async ({ closeReasonId, tenantId }: ShowCloseReasonParams): Promise<CloseReason> => {
    const closeReason = await CloseReason.findOne({
        where: { id: closeReasonId, tenantId }
    });

    if (!closeReason) {
        throw new AppError("ERR_NO_CLOSE_REASON_FOUND", 404);
    }

    return closeReason;
};

export default ShowCloseReasonService;
