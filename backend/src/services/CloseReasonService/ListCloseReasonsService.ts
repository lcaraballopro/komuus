import CloseReason from "../../models/CloseReason";
import ContactForm from "../../models/ContactForm";

interface ListCloseReasonsParams {
    tenantId: number;
    activeOnly?: boolean;
}

const ListCloseReasonsService = async ({ tenantId, activeOnly = false }: ListCloseReasonsParams): Promise<CloseReason[]> => {
    const whereClause: any = { tenantId };

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
