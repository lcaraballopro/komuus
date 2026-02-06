import CloseReason from "../../models/CloseReason";

interface CreateCloseReasonData {
    name: string;
    description?: string;
    category: "positive" | "negative";
    color?: string;
    order?: number;
    formId?: number;
    tenantId: number;
    whatsappId: number;
}

const CreateCloseReasonService = async (data: CreateCloseReasonData): Promise<CloseReason> => {
    const closeReason = await CloseReason.create({
        name: data.name,
        description: data.description,
        category: data.category,
        color: data.color || "#9e9e9e",
        order: data.order || 0,
        formId: data.formId,
        tenantId: data.tenantId,
        whatsappId: data.whatsappId,
        isActive: true
    });

    return closeReason;
};

export default CreateCloseReasonService;

