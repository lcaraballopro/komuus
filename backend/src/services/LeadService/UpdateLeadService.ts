import Lead from "../../models/Lead";
import AppError from "../../errors/AppError";

interface LeadData {
    name?: string;
    email?: string;
    phone?: string;
    sessionId?: string;
    source?: string;
    status?: string;
    metadata?: object;
}

interface Request {
    leadId: number;
    leadData: LeadData;
    tenantId?: number;
}

const UpdateLeadService = async ({
    leadId,
    leadData,
    tenantId
}: Request): Promise<Lead> => {
    const lead = await Lead.findOne({
        where: {
            id: leadId,
            ...(tenantId && { tenantId })
        }
    });

    if (!lead) {
        throw new AppError("ERR_LEAD_NOT_FOUND", 404);
    }

    // Merge metadata if provided
    if (leadData.metadata && lead.metadata) {
        leadData.metadata = { ...lead.metadata as object, ...leadData.metadata };
    }

    await lead.update(leadData);

    return lead;
};

export default UpdateLeadService;
