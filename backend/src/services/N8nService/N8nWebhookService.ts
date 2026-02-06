/**
 * N8nWebhookService - Triggers webhooks to n8n when customer messages arrive
 * 
 * Uses the AI Agent's webhook URL linked to the WhatsApp connection.
 * Provides enriched payload with complete ticket, contact, queue, and tenant information.
 */

import axios from "axios";
import { logger } from "../../utils/logger";
import { isBotActive } from "../BotStateService/BotStateService";
import Whatsapp from "../../models/Whatsapp";
import AIAgent from "../../models/AIAgent";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Company from "../../models/Company";
import Message from "../../models/Message";

/**
 * Enriched payload sent to n8n with all available context
 */
interface WebhookPayload {
    // Message info
    chatId: string;
    message: string;
    messageType: string;
    timestamp: string;
    isGroup: boolean;

    // Ticket info
    ticket: {
        id: number;
        status: string;
        unreadMessages: number;
        lastMessage: string;
        createdAt: string;
        updatedAt: string;
        isFirstMessage: boolean;
    };

    // Contact info
    contact: {
        id: number;
        name: string;
        number: string;
        email: string | null;
        profilePicUrl: string | null;
        createdAt: string;
    };

    // Queue info (if assigned)
    queue: {
        id: number | null;
        name: string | null;
        color: string | null;
    };

    // Agent info (if assigned)
    assignedAgent: {
        id: number | null;
        name: string | null;
        email: string | null;
    };

    // WhatsApp connection info
    whatsapp: {
        id: number;
        name: string;
        status: string;
    };

    // Tenant/Company info
    tenant: {
        id: number;
        name: string;
    };

    // AI Agent info
    aiAgent: {
        id: number;
        name: string;
    };

    // Metadata
    meta: {
        totalContactMessages: number;
        platform: string;
    };
}

interface TriggerOptions {
    chatId: string;
    ticketId: number;
    contactId: number;
    contactName: string;
    message: string;
    messageType: string;
    whatsappId: number;
    tenantId?: number;
    isGroup?: boolean;
}

/**
 * Get full context for webhook including all related entities
 */
const getFullWebhookContext = async (options: {
    whatsappId: number;
    ticketId: number;
    contactId: number;
}): Promise<{
    webhookUrl: string | null;
    apiToken: string | null;
    ticket: Ticket | null;
    contact: Contact | null;
    whatsapp: Whatsapp | null;
    company: Company | null;
    agent: AIAgent | null;
    totalMessages: number;
}> => {
    // Fetch whatsapp with AI agent and company
    const whatsapp = await Whatsapp.findByPk(options.whatsappId, {
        include: [
            { model: AIAgent, as: "aiAgent" },
            { model: Company, as: "company" }
        ]
    });

    if (!whatsapp?.aiAgent || !whatsapp.aiAgent.isActive) {
        return {
            webhookUrl: null,
            apiToken: null,
            ticket: null,
            contact: null,
            whatsapp: null,
            company: null,
            agent: null,
            totalMessages: 0
        };
    }

    // Fetch ticket with queue and user
    const ticket = await Ticket.findByPk(options.ticketId, {
        include: [
            { model: Queue, as: "queue" },
            { model: User, as: "user" }
        ]
    });

    // Fetch contact
    const contact = await Contact.findByPk(options.contactId);

    // Count total messages from this contact (to determine if first contact)
    const totalMessages = await Message.count({
        where: { contactId: options.contactId }
    });

    return {
        webhookUrl: whatsapp.aiAgent.webhookUrl,
        apiToken: whatsapp.aiAgent.apiToken,
        ticket,
        contact,
        whatsapp,
        company: whatsapp.company,
        agent: whatsapp.aiAgent,
        totalMessages
    };
};

/**
 * Trigger webhook to n8n with enriched message data
 */
const triggerN8nWebhook = async (options: TriggerOptions): Promise<boolean> => {
    const context = await getFullWebhookContext({
        whatsappId: options.whatsappId,
        ticketId: options.ticketId,
        contactId: options.contactId
    });

    if (!context.webhookUrl) {
        logger.debug(`No AI Agent for WhatsApp ${options.whatsappId}`);
        return false;
    }

    const botActive = await isBotActive(options.chatId);
    if (!botActive) {
        logger.debug(`Bot inactive for ${options.chatId}`);
        return false;
    }

    const { ticket, contact, whatsapp, company, agent, totalMessages } = context;

    // Build enriched payload
    const payload: WebhookPayload = {
        // Message info
        chatId: options.chatId,
        message: options.message,
        messageType: options.messageType,
        timestamp: new Date().toISOString(),
        isGroup: options.isGroup || false,

        // Ticket info
        ticket: {
            id: ticket?.id || options.ticketId,
            status: ticket?.status || "pending",
            unreadMessages: ticket?.unreadMessages || 0,
            lastMessage: ticket?.lastMessage || options.message,
            createdAt: ticket?.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: ticket?.updatedAt?.toISOString() || new Date().toISOString(),
            isFirstMessage: totalMessages <= 1
        },

        // Contact info
        contact: {
            id: contact?.id || 0,
            name: contact?.name || options.contactName,
            number: contact?.number || options.chatId.replace(/@.*/, ""),
            email: contact?.email || null,
            profilePicUrl: contact?.profilePicUrl || null,
            createdAt: contact?.createdAt?.toISOString() || new Date().toISOString()
        },

        // Queue info
        queue: {
            id: ticket?.queue?.id || null,
            name: ticket?.queue?.name || null,
            color: ticket?.queue?.color || null
        },

        // Assigned agent info
        assignedAgent: {
            id: ticket?.user?.id || null,
            name: ticket?.user?.name || null,
            email: ticket?.user?.email || null
        },

        // WhatsApp connection info
        whatsapp: {
            id: whatsapp?.id || options.whatsappId,
            name: whatsapp?.name || "Unknown",
            status: whatsapp?.status || "UNKNOWN"
        },

        // Tenant/Company info
        tenant: {
            id: company?.id || options.tenantId || 1,
            name: company?.name || "Default"
        },

        // AI Agent info
        aiAgent: {
            id: agent?.id || 0,
            name: agent?.name || "Unknown"
        },

        // Metadata
        meta: {
            totalContactMessages: totalMessages,
            platform: "whatsapp"
        }
    };

    try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (context.apiToken) headers["Authorization"] = `Bearer ${context.apiToken}`;

        const response = await axios.post(context.webhookUrl, payload, { headers, timeout: 10000 });
        logger.info(`n8n webhook for ${options.chatId}: ${response.status}`);
        return true;
    } catch (error: any) {
        logger.error(`n8n webhook error: ${error.message}`);
        return false;
    }
};

/**
 * Get the AI Agent's webhook URL for a WhatsApp connection (legacy compatibility)
 */
const getAgentWebhookUrl = async (whatsappId: number): Promise<{
    webhookUrl: string | null;
    apiToken: string | null;
    tenantId: number | null;
}> => {
    const whatsapp = await Whatsapp.findByPk(whatsappId, {
        include: [{ model: AIAgent, as: "aiAgent" }]
    });

    if (!whatsapp?.aiAgent || !whatsapp.aiAgent.isActive) {
        return { webhookUrl: null, apiToken: null, tenantId: null };
    }

    return {
        webhookUrl: whatsapp.aiAgent.webhookUrl,
        apiToken: whatsapp.aiAgent.apiToken,
        tenantId: whatsapp.tenantId
    };
};

/**
 * Test agent webhook connectivity
 */
const testAgentConnection = async (agentId: number): Promise<{ success: boolean; message: string }> => {
    const agent = await AIAgent.findByPk(agentId);
    if (!agent?.webhookUrl) return { success: false, message: "No webhook URL" };

    try {
        await axios.post(agent.webhookUrl, { type: "ping", agentId: agent.id }, {
            timeout: 5000,
            headers: agent.apiToken ? { Authorization: `Bearer ${agent.apiToken}` } : {}
        });
        return { success: true, message: "Connection successful" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

export { triggerN8nWebhook, testAgentConnection, getAgentWebhookUrl, WebhookPayload, TriggerOptions };
