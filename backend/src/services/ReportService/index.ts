import { Op, fn, col, literal } from "sequelize";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Contact from "../../models/Contact";

interface DateFilter {
    startDate?: string;
    endDate?: string;
}

interface ReportFilters extends DateFilter {
    userId?: number;
    queueId?: number;
    status?: string;
    tenantId: number;
}

interface TicketStats {
    total: number;
    open: number;
    pending: number;
    closed: number;
    bot: number;
    avgResponseTime: number | null;
}

interface AgentPerformance {
    userId: number;
    userName: string;
    totalTickets: number;
    closedTickets: number;
    openTickets: number;
    avgResponseTime: number | null;
}

interface QueueStats {
    queueId: number;
    queueName: string;
    queueColor: string;
    totalTickets: number;
    openTickets: number;
    pendingTickets: number;
    closedTickets: number;
}

interface DailyStats {
    date: string;
    created: number;
    closed: number;
}

const buildDateFilter = (filters: DateFilter) => {
    const where: any = {};

    if (filters.startDate) {
        where.createdAt = {
            ...where.createdAt,
            [Op.gte]: new Date(`${filters.startDate}T00:00:00.000Z`)
        };
    }

    if (filters.endDate) {
        where.createdAt = {
            ...where.createdAt,
            [Op.lte]: new Date(`${filters.endDate}T23:59:59.999Z`)
        };
    }

    return where;
};

export const GetTicketStats = async (filters: ReportFilters): Promise<TicketStats> => {
    const dateFilter = buildDateFilter(filters);

    const baseWhere: any = {
        tenantId: filters.tenantId,
        ...dateFilter
    };

    if (filters.userId) baseWhere.userId = filters.userId;
    if (filters.queueId) baseWhere.queueId = filters.queueId;

    const [total, open, pending, closed, bot] = await Promise.all([
        Ticket.count({ where: baseWhere }),
        Ticket.count({ where: { ...baseWhere, status: "open" } }),
        Ticket.count({ where: { ...baseWhere, status: "pending" } }),
        Ticket.count({ where: { ...baseWhere, status: "closed" } }),
        Ticket.count({ where: { ...baseWhere, status: "bot" } }),
    ]);

    // Calculate average response time (time from creation to first agent message)
    // This is a simplified version - in production, you'd track this more precisely
    const avgResponseTime = null; // TODO: Implement precise tracking

    return {
        total,
        open,
        pending,
        closed,
        bot,
        avgResponseTime
    };
};

export const GetAgentPerformance = async (filters: ReportFilters): Promise<AgentPerformance[]> => {
    const dateFilter = buildDateFilter(filters);

    const users = await User.findAll({
        where: { tenantId: filters.tenantId },
        attributes: ["id", "name"],
    });

    const performance: AgentPerformance[] = [];

    for (const user of users) {
        const baseWhere: any = {
            tenantId: filters.tenantId,
            userId: user.id,
            ...dateFilter
        };

        if (filters.queueId) baseWhere.queueId = filters.queueId;

        const [totalTickets, closedTickets, openTickets] = await Promise.all([
            Ticket.count({ where: baseWhere }),
            Ticket.count({ where: { ...baseWhere, status: "closed" } }),
            Ticket.count({ where: { ...baseWhere, status: "open" } }),
        ]);

        if (totalTickets > 0) {
            performance.push({
                userId: user.id,
                userName: user.name,
                totalTickets,
                closedTickets,
                openTickets,
                avgResponseTime: null
            });
        }
    }

    // Sort by total tickets descending
    performance.sort((a, b) => b.totalTickets - a.totalTickets);

    return performance;
};

export const GetQueueStats = async (filters: ReportFilters): Promise<QueueStats[]> => {
    const dateFilter = buildDateFilter(filters);

    const queues = await Queue.findAll({
        where: { tenantId: filters.tenantId },
        attributes: ["id", "name", "color"],
    });

    const stats: QueueStats[] = [];

    for (const queue of queues) {
        const baseWhere: any = {
            tenantId: filters.tenantId,
            queueId: queue.id,
            ...dateFilter
        };

        if (filters.userId) baseWhere.userId = filters.userId;

        const [totalTickets, openTickets, pendingTickets, closedTickets] = await Promise.all([
            Ticket.count({ where: baseWhere }),
            Ticket.count({ where: { ...baseWhere, status: "open" } }),
            Ticket.count({ where: { ...baseWhere, status: "pending" } }),
            Ticket.count({ where: { ...baseWhere, status: "closed" } }),
        ]);

        stats.push({
            queueId: queue.id,
            queueName: queue.name,
            queueColor: queue.color,
            totalTickets,
            openTickets,
            pendingTickets,
            closedTickets
        });
    }

    // Also add unassigned queue stats
    const unassignedWhere: any = {
        tenantId: filters.tenantId,
        queueId: null,
        ...dateFilter
    };

    if (filters.userId) unassignedWhere.userId = filters.userId;

    const [unassignedTotal, unassignedOpen, unassignedPending, unassignedClosed] = await Promise.all([
        Ticket.count({ where: unassignedWhere }),
        Ticket.count({ where: { ...unassignedWhere, status: "open" } }),
        Ticket.count({ where: { ...unassignedWhere, status: "pending" } }),
        Ticket.count({ where: { ...unassignedWhere, status: "closed" } }),
    ]);

    if (unassignedTotal > 0) {
        stats.push({
            queueId: 0,
            queueName: "Sin asignar",
            queueColor: "#999999",
            totalTickets: unassignedTotal,
            openTickets: unassignedOpen,
            pendingTickets: unassignedPending,
            closedTickets: unassignedClosed
        });
    }

    return stats;
};

export const GetDailyStats = async (filters: ReportFilters): Promise<DailyStats[]> => {
    const startDate = filters.startDate
        ? new Date(`${filters.startDate}T00:00:00.000Z`)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    const endDate = filters.endDate
        ? new Date(`${filters.endDate}T23:59:59.999Z`)
        : new Date();

    const baseWhere: any = {
        tenantId: filters.tenantId,
        createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
        }
    };

    if (filters.userId) baseWhere.userId = filters.userId;
    if (filters.queueId) baseWhere.queueId = filters.queueId;

    // Get all tickets in the date range
    const tickets = await Ticket.findAll({
        where: baseWhere,
        attributes: ["createdAt", "updatedAt", "status"],
        raw: true
    });

    // Group by date
    const dailyMap = new Map<string, { created: number; closed: number }>();

    // Initialize all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        dailyMap.set(dateStr, { created: 0, closed: 0 });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count tickets
    tickets.forEach((ticket: any) => {
        const createdDate = new Date(ticket.createdAt).toISOString().split("T")[0];
        if (dailyMap.has(createdDate)) {
            const stats = dailyMap.get(createdDate)!;
            stats.created++;
        }

        // If closed, count in closed stats
        if (ticket.status === "closed") {
            const closedDate = new Date(ticket.updatedAt).toISOString().split("T")[0];
            if (dailyMap.has(closedDate)) {
                const stats = dailyMap.get(closedDate)!;
                stats.closed++;
            }
        }
    });

    // Convert to array
    const result: DailyStats[] = [];
    dailyMap.forEach((stats, date) => {
        result.push({
            date,
            created: stats.created,
            closed: stats.closed
        });
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
};

export const GetContactStats = async (filters: ReportFilters): Promise<{ total: number; newThisPeriod: number }> => {
    const dateFilter = buildDateFilter(filters);

    const total = await Contact.count({
        where: { tenantId: filters.tenantId }
    });

    const newThisPeriod = await Contact.count({
        where: {
            tenantId: filters.tenantId,
            ...dateFilter
        }
    });

    return { total, newThisPeriod };
};

interface TicketDetail {
    id: number;
    protocol: string;
    contactName: string;
    contactNumber: string;
    agentName: string | null;
    queueName: string | null;
    queueColor: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt: Date | null;
    totalDuration: number; // in seconds
    botDuration: number; // in seconds
    agentDuration: number; // in seconds
    messageCount: number;
}

interface PaginatedTicketDetails {
    tickets: TicketDetail[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const GetDetailedTickets = async (
    filters: ReportFilters & { page?: number; limit?: number }
): Promise<PaginatedTicketDetails> => {
    const dateFilter = buildDateFilter(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const baseWhere: any = {
        tenantId: filters.tenantId,
        ...dateFilter
    };

    if (filters.userId) baseWhere.userId = filters.userId;
    if (filters.queueId) baseWhere.queueId = filters.queueId;
    if (filters.status) baseWhere.status = filters.status;

    const { count: total, rows: tickets } = await Ticket.findAndCountAll({
        where: baseWhere,
        include: [
            { model: User, as: "user", attributes: ["id", "name"] },
            { model: Contact, as: "contact", attributes: ["id", "name", "number"] },
            { model: Queue, as: "queue", attributes: ["id", "name", "color"] }
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset
    });

    const ticketDetails: TicketDetail[] = [];

    for (const ticket of tickets) {
        // Get messages to calculate bot vs agent time
        const messages = await Message.findAll({
            where: { ticketId: ticket.id },
            attributes: ["fromMe", "createdAt", "sender"],
            order: [["createdAt", "ASC"]],
            raw: true
        });

        // Calculate durations
        const createdAt = new Date(ticket.createdAt);
        const closedAt = ticket.status === "closed" ? new Date(ticket.updatedAt) : null;
        const endTime = closedAt || new Date();

        const totalDuration = Math.floor((endTime.getTime() - createdAt.getTime()) / 1000);

        // Calculate bot duration (from creation until first agent interaction or status change from 'bot')
        let botDuration = 0;
        let agentDuration = 0;

        // Find first agent message (fromMe = true and not from bot)
        const firstAgentMessage = messages.find((msg: any) =>
            msg.fromMe === true && (!msg.sender || !msg.sender.includes("bot"))
        );

        if (firstAgentMessage) {
            const firstAgentTime = new Date((firstAgentMessage as any).createdAt);
            botDuration = Math.floor((firstAgentTime.getTime() - createdAt.getTime()) / 1000);
            agentDuration = Math.floor((endTime.getTime() - firstAgentTime.getTime()) / 1000);
        } else if (ticket.status === "bot") {
            // Still with bot
            botDuration = totalDuration;
            agentDuration = 0;
        } else {
            // Assigned but no agent messages yet
            botDuration = 0;
            agentDuration = totalDuration;
        }

        ticketDetails.push({
            id: ticket.id,
            protocol: `#${ticket.id}`,
            contactName: ticket.contact?.name || "Sin nombre",
            contactNumber: ticket.contact?.number || "",
            agentName: ticket.user?.name || null,
            queueName: ticket.queue?.name || null,
            queueColor: ticket.queue?.color || null,
            status: ticket.status,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            closedAt,
            totalDuration,
            botDuration,
            agentDuration,
            messageCount: messages.length
        });
    }

    return {
        tickets: ticketDetails,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export default {
    GetTicketStats,
    GetAgentPerformance,
    GetQueueStats,
    GetDailyStats,
    GetContactStats,
    GetDetailedTickets
};

