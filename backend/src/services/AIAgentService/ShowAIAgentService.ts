import AIAgent from "../../models/AIAgent";
import AppError from "../../errors/AppError";

interface Request {
    id: string | number;
    tenantId: number;
}

const ShowAIAgentService = async ({ id, tenantId }: Request): Promise<AIAgent> => {
    const agent = await AIAgent.findOne({
        where: { id, tenantId }
    });

    if (!agent) {
        throw new AppError("ERR_NO_AI_AGENT_FOUND", 404);
    }

    return agent;
};

export default ShowAIAgentService;
