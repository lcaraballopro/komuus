import { Op } from "sequelize";
import Lead from "../../models/Lead";

interface Request {
    searchParam?: string;
    status?: string;
    source?: string;
    pageNumber?: string;
    tenantId?: number;
}

interface Response {
    leads: Lead[];
    count: number;
    hasMore: boolean;
}

const ListLeadsService = async ({
    searchParam = "",
    status,
    source,
    pageNumber = "1",
    tenantId
}: Request): Promise<Response> => {
    const limit = 20;
    const offset = limit * (parseInt(pageNumber) - 1);

    const whereClause: any = {};

    if (tenantId) {
        whereClause.tenantId = tenantId;
    }

    if (status) {
        whereClause.status = status;
    }

    if (source) {
        whereClause.source = source;
    }

    if (searchParam) {
        whereClause[Op.or] = [
            { name: { [Op.iLike]: `%${searchParam}%` } },
            { email: { [Op.iLike]: `%${searchParam}%` } },
            { phone: { [Op.iLike]: `%${searchParam}%` } }
        ];
    }

    const { count, rows: leads } = await Lead.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["createdAt", "DESC"]]
    });

    const hasMore = count > offset + leads.length;

    return { leads, count, hasMore };
};

export default ListLeadsService;
