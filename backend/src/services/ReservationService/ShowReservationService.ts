import Reservation from "../../models/Reservation";
import Contact from "../../models/Contact";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface ShowReservationParams {
    reservationId: number;
    tenantId: number;
}

const ShowReservationService = async ({ reservationId, tenantId }: ShowReservationParams): Promise<Reservation> => {
    const reservation = await Reservation.findOne({
        where: { id: reservationId, tenantId },
        include: [
            { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
            { model: User, as: "user", attributes: ["id", "name"] }
        ]
    });

    if (!reservation) {
        throw new AppError("ERR_NO_RESERVATION_FOUND", 404);
    }

    return reservation;
};

export default ShowReservationService;
