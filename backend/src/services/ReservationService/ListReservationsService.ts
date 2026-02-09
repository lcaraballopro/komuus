import { Op } from "sequelize";
import Reservation from "../../models/Reservation";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface ListReservationsParams {
    tenantId: number;
    status?: string;
    contactId?: number;
    userId?: number;
    startDate?: string;
    endDate?: string;
}

const ListReservationsService = async ({
    tenantId,
    status,
    contactId,
    userId,
    startDate,
    endDate
}: ListReservationsParams): Promise<Reservation[]> => {
    const whereClause: any = { tenantId };

    if (status) {
        whereClause.status = status;
    }

    if (contactId) {
        whereClause.contactId = contactId;
    }

    if (userId) {
        whereClause.userId = userId;
    }

    if (startDate && endDate) {
        whereClause.startDate = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    } else if (startDate) {
        whereClause.startDate = {
            [Op.gte]: new Date(startDate)
        };
    } else if (endDate) {
        whereClause.startDate = {
            [Op.lte]: new Date(endDate)
        };
    }

    const reservations = await Reservation.findAll({
        where: whereClause,
        include: [
            { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
            { model: User, as: "user", attributes: ["id", "name"] }
        ],
        order: [["startDate", "ASC"]]
    });

    return reservations;
};

export default ListReservationsService;
