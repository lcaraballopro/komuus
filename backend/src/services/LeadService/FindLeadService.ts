import { Op } from "sequelize";
import Lead from "../../models/Lead";

interface Request {
    email?: string;
    phone?: string;
    sessionId?: string;
    tenantId?: number;
}

const FindLeadService = async ({
    email,
    phone,
    sessionId,
    tenantId
}: Request): Promise<Lead | null> => {
    const whereConditions: any[] = [];

    if (email) {
        whereConditions.push({ email });
    }

    if (phone) {
        whereConditions.push({ phone });
    }

    if (sessionId) {
        whereConditions.push({ sessionId });
    }

    if (whereConditions.length === 0) {
        return null;
    }

    const lead = await Lead.findOne({
        where: {
            [Op.or]: whereConditions,
            ...(tenantId && { tenantId })
        },
        order: [["updatedAt", "DESC"]]
    });

    return lead;
};

export default FindLeadService;
