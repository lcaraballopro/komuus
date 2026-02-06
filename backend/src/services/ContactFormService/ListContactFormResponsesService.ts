import ContactFormResponse from "../../models/ContactFormResponse";
import ContactFormResponseValue from "../../models/ContactFormResponseValue";
import ContactFormField from "../../models/ContactFormField";
import ContactForm from "../../models/ContactForm";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";

interface Request {
    formId: string | number;
    ticketId?: string | number;
    contactId?: string | number;
    pageNumber?: string;
    tenantId: number;
}

interface Response {
    responses: ContactFormResponse[];
    count: number;
    hasMore: boolean;
}

const ListContactFormResponsesService = async ({
    formId,
    ticketId,
    contactId,
    pageNumber = "1",
    tenantId
}: Request): Promise<Response> => {
    const whereCondition: any = { tenantId };

    if (formId) {
        whereCondition.formId = formId;
    }

    if (ticketId) {
        whereCondition.ticketId = ticketId;
    }

    if (contactId) {
        whereCondition.contactId = contactId;
    }

    const limit = 20;
    const offset = limit * (+pageNumber - 1);

    const { count, rows: responses } = await ContactFormResponse.findAndCountAll({
        where: whereCondition,
        include: [
            {
                model: ContactFormResponseValue,
                as: "values",
                include: [
                    {
                        model: ContactFormField,
                        as: "field",
                        attributes: ["id", "type", "label"]
                    }
                ]
            },
            {
                model: ContactForm,
                as: "form",
                attributes: ["id", "name"]
            },
            {
                model: Contact,
                as: "contact",
                attributes: ["id", "name", "number"]
            },
            {
                model: Ticket,
                as: "ticket",
                attributes: ["id", "status"]
            },
            {
                model: User,
                as: "submitter",
                attributes: ["id", "name"]
            }
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]]
    });

    const hasMore = count > offset + responses.length;

    return {
        responses,
        count,
        hasMore
    };
};

export default ListContactFormResponsesService;
