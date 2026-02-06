import { Request, Response } from "express";
import CreateLeadService from "../services/LeadService/CreateLeadService";
import FindLeadService from "../services/LeadService/FindLeadService";
import UpdateLeadService from "../services/LeadService/UpdateLeadService";
import ListLeadsService from "../services/LeadService/ListLeadsService";
import Lead from "../models/Lead";
import AppError from "../errors/AppError";

/**
 * POST /api/leads
 * Create or update (upsert) a lead
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, phone, sessionId, source, status, metadata, tenantId } = req.body;

    const { lead, created } = await CreateLeadService({
        name,
        email,
        phone,
        sessionId,
        source,
        status,
        metadata,
        tenantId
    });

    return res.status(created ? 201 : 200).json({
        lead,
        created,
        message: created ? "Lead created successfully" : "Lead already exists, updated"
    });
};

/**
 * GET /api/leads/find
 * Find a lead by email, phone or sessionId
 */
export const find = async (req: Request, res: Response): Promise<Response> => {
    const { email, phone, sessionId, tenantId } = req.query as {
        email?: string;
        phone?: string;
        sessionId?: string;
        tenantId?: string;
    };

    const lead = await FindLeadService({
        email,
        phone,
        sessionId,
        tenantId: tenantId ? parseInt(tenantId) : undefined
    });

    if (!lead) {
        return res.status(404).json({
            exists: false,
            lead: null
        });
    }

    return res.json({
        exists: true,
        lead
    });
};

/**
 * GET /api/leads
 * List leads with filters and pagination
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
    const { searchParam, status, source, pageNumber, tenantId } = req.query as {
        searchParam?: string;
        status?: string;
        source?: string;
        pageNumber?: string;
        tenantId?: string;
    };

    const { leads, count, hasMore } = await ListLeadsService({
        searchParam,
        status,
        source,
        pageNumber,
        tenantId: tenantId ? parseInt(tenantId) : undefined
    });

    return res.json({
        leads,
        count,
        hasMore
    });
};

/**
 * GET /api/leads/:id
 * Show a single lead by ID
 */
export const show = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { tenantId } = req.query as { tenantId?: string };

    const lead = await Lead.findOne({
        where: {
            id: parseInt(id),
            ...(tenantId && { tenantId: parseInt(tenantId) })
        }
    });

    if (!lead) {
        throw new AppError("ERR_LEAD_NOT_FOUND", 404);
    }

    return res.json(lead);
};

/**
 * PUT /api/leads/:id
 * Update a lead
 */
export const update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { name, email, phone, sessionId, source, status, metadata, tenantId } = req.body;

    const lead = await UpdateLeadService({
        leadId: parseInt(id),
        leadData: { name, email, phone, sessionId, source, status, metadata },
        tenantId
    });

    return res.json({
        lead,
        message: "Lead updated successfully"
    });
};
