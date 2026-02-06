import { Request, Response } from "express";
import {
    GetTicketStats,
    GetAgentPerformance,
    GetQueueStats,
    GetDailyStats,
    GetContactStats,
    GetDetailedTickets
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
    const { tenantId } = req.user as any;
    const { startDate, endDate, userId, queueId, status, page, limit } = req.query;

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

    const [ticketStatsData, agentPerformanceData, queueStatsData, dailyStatsData, contactStatsData] =
        await Promise.all([
            GetTicketStats(filters),
            GetAgentPerformance(filters),
            GetQueueStats(filters),
            GetDailyStats(filters),
            GetContactStats(filters)
        ]);

    return res.json({
        tickets: ticketStatsData,
        agents: agentPerformanceData,
        queues: queueStatsData,
        daily: dailyStatsData,
        contacts: contactStatsData
    });
};

