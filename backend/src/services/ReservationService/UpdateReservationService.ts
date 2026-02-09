import Reservation from "../../models/Reservation";
import Contact from "../../models/Contact";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface UpdateReservationData {
    reservationId: number;
    tenantId: number;
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    status?: "pending" | "confirmed" | "completed" | "cancelled";
    notes?: string;
    color?: string;
    contactId?: number;
    userId?: number;
    ticketId?: number;
}

const UpdateReservationService = async (data: UpdateReservationData): Promise<Reservation> => {
    const { reservationId, tenantId, ...updateData } = data;

    const reservation = await Reservation.findOne({
        where: { id: reservationId, tenantId }
    });

    if (!reservation) {
        throw new AppError("ERR_NO_RESERVATION_FOUND", 404);
    }

    await reservation.update(updateData);

    await reservation.reload({
        include: [
            { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
            { model: User, as: "user", attributes: ["id", "name"] }
        ]
    });

    return reservation;
};

export default UpdateReservationService;
