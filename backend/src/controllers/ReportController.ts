import { Request, Response } from "express";
import {
    GetTicketStats,
    GetAgentPerformance,
    GetQueueStats,
    GetDailyStats,
    GetContactStats,
    GetDetailedTickets,
    GetTypificationStats,
    GetFormResponsesReport
} from "../services/ReportService";

export const ticketStats = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user as any;
    const { startDate, endDate, userId, queueId, status } = req.query;

    const stats = await GetTicketStats({
        tenantId,
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId ? Number(userId) : undefined,
        queueId: queueId ? Number(queueId) : undefined,
        status: status as string
    });

    return res.json(stats);
};

export const agentPerformance = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user as any;
    const { startDate, endDate, queueId } = req.query;

    const performance = await GetAgentPerformance({
        tenantId,
        startDate: startDate as string,
        endDate: endDate as string,
        queueId: queueId ? Number(queueId) : undefined
    });

    return res.json(performance);
};

export const queueStats = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user as any;
    const { startDate, endDate, userId } = req.query;

    const stats = await GetQueueStats({
        tenantId,
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId ? Number(userId) : undefined
    });

    return res.json(stats);
};

export const dailyStats = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user as any;
    const { startDate, endDate, userId, queueId } = req.query;

    const stats = await GetDailyStats({
        tenantId,
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId ? Number(userId) : undefined,
        queueId: queueId ? Number(queueId) : undefined
    });

    return res.json(stats);
};

export const contactStats = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user as any;
    const { startDate, endDate } = req.query;

    const stats = await GetContactStats({
        tenantId,
        startDate: startDate as string,
        endDate: endDate as string
    });

    return res.json(stats);
};

// Detailed tickets list for conversations table
export const detailedTickets = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { tenantId } = req.user as any;
        const { startDate, endDate, userId, queueId, status, page, limit } = req.query;

        console.log("Fetching detailed tickets with filters:", { startDate, endDate, userId, queueId, status, page, limit });

        const data = await GetDetailedTickets({
            tenantId,
            startDate: startDate as string,
            endDate: endDate as string,
            userId: userId ? Number(userId) : undefined,
            queueId: queueId ? Number(queueId) : undefined,
            status: status as string,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20
        });

        return res.json(data);
    } catch (err) {
        console.error("Error fetching detailed tickets:", err);
        // Return 500 with error message to help debugging on frontend if possible, or just log it
        return res.status(500).json({ error: "Internal Server Error", message: err.message, stack: err.stack });
    }
};

// Combined endpoint for dashboard
export const dashboardStats = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user as any;
    const { startDate, endDate, userId, queueId } = req.query;

    const filters = {
        tenantId,
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId ? Number(userId) : undefined,
        queueId: queueId ? Number(queueId) : undefined
    };

    const [ticketStatsData, agentPerformanceData, queueStatsData, dailyStatsData, contactStatsData, typificationData] =
        await Promise.all([
            GetTicketStats(filters),
            GetAgentPerformance(filters),
            GetQueueStats(filters),
            GetDailyStats(filters),
            GetContactStats(filters),
            GetTypificationStats(filters)
        ]);

    return res.json({
        tickets: ticketStatsData,
        agents: agentPerformanceData,
        queues: queueStatsData,
        daily: dailyStatsData,
        contacts: contactStatsData,
        typifications: typificationData
    });
};

// Form responses report - client info + form data
export const formResponses = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user as any;
    const { startDate, endDate, userId, queueId, page, limit } = req.query;

    const data = await GetFormResponsesReport({
        tenantId,
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId ? Number(userId) : undefined,
        queueId: queueId ? Number(queueId) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
    });

    return res.json(data);
};

