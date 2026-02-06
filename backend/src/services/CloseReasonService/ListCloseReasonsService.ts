import CloseReason from "../../models/CloseReason";
import ContactForm from "../../models/ContactForm";

interface ListCloseReasonsParams {
    tenantId: number;
    whatsappId?: number;
    activeOnly?: boolean;
}

const ListCloseReasonsService = async ({ tenantId, whatsappId, activeOnly = false }: ListCloseReasonsParams): Promise<CloseReason[]> => {
    const whereClause: any = { tenantId };

    if (whatsappId) {
        whereClause.whatsappId = whatsappId;
    }

    if (activeOnly) {
        whereClause.isActive = true;
    }

    const closeReasons = await CloseReason.findAll({
        where: whereClause,
        include: [
            {
                model: ContactForm,
                as: "form",
                attributes: ["id", "name"]
            }
        ],
        order: [
            ["order", "ASC"],
            ["name", "ASC"]
        ]
    });

    return closeReasons;
};

export default ListCloseReasonsService;

