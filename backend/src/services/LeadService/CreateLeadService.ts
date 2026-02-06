import Lead from "../../models/Lead";
import Company from "../../models/Company";
import AppError from "../../errors/AppError";

interface Request {
    name?: string;
    email?: string;
    phone?: string;
    sessionId?: string;
    source?: string;
    status?: string;
    metadata?: object;
    tenantId?: number;
}

interface Response {
    lead: Lead;
    created: boolean;
}

const CreateLeadService = async ({
    name,
    email,
    phone,
    sessionId,
    source = "landing-chat",
    status = "new",
    metadata,
    tenantId
}: Request): Promise<Response> => {
    // Must have at least email or phone
    if (!email && !phone) {
        throw new AppError("ERR_LEAD_REQUIRES_EMAIL_OR_PHONE", 400);
    }

    // Check if lead already exists by email or phone
    let existingLead: Lead | null = null;

    if (email) {
        existingLead = await Lead.findOne({
            where: { email, ...(tenantId && { tenantId }) }
        });
    }

    if (!existingLead && phone) {
        existingLead = await Lead.findOne({
            where: { phone, ...(tenantId && { tenantId }) }
        });
    }

    if (existingLead) {
        // Update existing lead with new data if provided
        const updates: Partial<Request> = {};
        if (name && !existingLead.name) updates.name = name;
        if (email && !existingLead.email) updates.email = email;
        if (phone && !existingLead.phone) updates.phone = phone;
        if (sessionId) updates.sessionId = sessionId;
        if (metadata) {
            updates.metadata = { ...existingLead.metadata as object, ...metadata };
        }

        if (Object.keys(updates).length > 0) {
            await existingLead.update(updates);
        }

        return { lead: existingLead, created: false };
    }

    // Get default tenant if not provided
    let finalTenantId = tenantId;
    if (!finalTenantId) {
        const defaultCompany = await Company.findOne({ where: { slug: "default" } });
        finalTenantId = defaultCompany?.id || 1;
    }

    // Create new lead
    const lead = await Lead.create({
        name,
        email,
        phone,
        sessionId,
        source,
        status,
        metadata,
        tenantId: finalTenantId
    });

    return { lead, created: true };
};

export default CreateLeadService;
