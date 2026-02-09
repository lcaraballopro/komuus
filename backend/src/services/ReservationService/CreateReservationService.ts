import Reservation from "../../models/Reservation";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface CreateReservationData {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    status?: "pending" | "confirmed" | "completed" | "cancelled";
    notes?: string;
    color?: string;
    contactId?: number;
    userId?: number;
    ticketId?: number;
    tenantId: number;
}

const CreateReservationService = async (data: CreateReservationData): Promise<Reservation> => {
    const reservation = await Reservation.create({
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || "pending",
        notes: data.notes,
        color: data.color || "#2576d2",
        contactId: data.contactId,
        userId: data.userId,
        ticketId: data.ticketId,
        tenantId: data.tenantId
    });

    // Reload with associations
    await reservation.reload({
        include: [
            { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
            { model: User, as: "user", attributes: ["id", "name"] }
        ]
    });

    return reservation;
};

export default CreateReservationService;
