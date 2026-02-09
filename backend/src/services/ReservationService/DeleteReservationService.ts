import Reservation from "../../models/Reservation";
import AppError from "../../errors/AppError";

interface DeleteReservationParams {
    reservationId: number;
    tenantId: number;
}

const DeleteReservationService = async ({ reservationId, tenantId }: DeleteReservationParams): Promise<void> => {
    const reservation = await Reservation.findOne({
        where: { id: reservationId, tenantId }
    });

    if (!reservation) {
        throw new AppError("ERR_NO_RESERVATION_FOUND", 404);
    }

    await reservation.destroy();
};

export default DeleteReservationService;
