import AIAgent from "../../models/AIAgent";
import AppError from "../../errors/AppError";

interface AgentData {
    name?: string;
    webhookUrl?: string;
    apiToken?: string;
    isActive?: boolean;
}

interface Request {
    agentData: AgentData;
    agentId: string | number;
    tenantId: number;
}

const UpdateAIAgentService = async ({
    agentData,
    agentId,
    tenantId
}: Request): Promise<AIAgent> => {
    const agent = await AIAgent.findOne({
        where: { id: agentId, tenantId }
    });

    if (!agent) {
        throw new AppError("ERR_NO_AI_AGENT_FOUND", 404);
    }

    const { name, webhookUrl, apiToken, isActive } = agentData;

    await agent.update({
        name,
        webhookUrl,
        apiToken,
        isActive
    });

    await agent.reload();

    return agent;
};

export default UpdateAIAgentService;
