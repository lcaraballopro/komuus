import { Op } from "sequelize";
import ContactForm from "../../models/ContactForm";
import ContactFormField from "../../models/ContactFormField";

interface Request {
    searchParam?: string;
    pageNumber?: string;
    tenantId: number;
    whatsappId?: number;
}

interface Response {
    contactForms: ContactForm[];
    count: number;
    hasMore: boolean;
}

const ListContactFormsService = async ({
    searchParam = "",
    pageNumber = "1",
    tenantId,
    whatsappId
}: Request): Promise<Response> => {
    const whereCondition: any = { tenantId };

    if (whatsappId) {
        whereCondition.whatsappId = whatsappId;
    }

    if (searchParam) {
        whereCondition[Op.or] = [
            { name: { [Op.iLike]: `%${searchParam}%` } },
            { description: { [Op.iLike]: `%${searchParam}%` } }
        ];
    }

    const limit = 20;
    const offset = limit * (+pageNumber - 1);

    const { count, rows: contactForms } = await ContactForm.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: ContactFormField,
                as: "fields",
                separate: true,
                order: [["order", "ASC"]]
            }
        ],
        limit,
        offset,
        order: [["name", "ASC"]]
    });

    const hasMore = count > offset + contactForms.length;

    return {
        contactForms,
        count,
        hasMore
    };
};

export default ListContactFormsService;
