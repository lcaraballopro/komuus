import { Op } from "sequelize";
import Company from "../../models/Company";

interface Request {
    searchParam?: string;
}

interface Response {
    companies: Company[];
    count: number;
}

const ListCompaniesService = async ({
    searchParam = ""
}: Request): Promise<Response> => {
    const whereCondition: { name?: { [Op.iLike]: string } } = {};

    if (searchParam) {
        whereCondition.name = {
            [Op.iLike]: `%${searchParam}%`
        };
    }

    const { count, rows: companies } = await Company.findAndCountAll({
        where: whereCondition,
        order: [["name", "ASC"]]
    });

    return { companies, count };
};

export default ListCompaniesService;
