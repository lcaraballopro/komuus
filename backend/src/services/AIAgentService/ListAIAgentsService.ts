import { Op } from "sequelize";
import AIAgent from "../../models/AIAgent";

interface Request {
    searchParam?: string;
    tenantId: number;
}

interface Response {
    agents: AIAgent[];
    count: number;
}

const ListAIAgentsService = async ({
    searchParam = "",
    tenantId
}: Request): Promise<Response> => {
    const whereCondition: { tenantId: number; name?: { [Op.iLike]: string } } = { tenantId };

    if (searchParam) {
        whereCondition.name = {
            [Op.iLike]: `%${searchParam}%`
        };
    }

    const { count, rows: agents } = await AIAgent.findAndCountAll({
        where: whereCondition,
        order: [["name", "ASC"]]
    });

    return { agents, count };
};

export default ListAIAgentsService;
