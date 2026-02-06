import AIAgent from "../../models/AIAgent";
import AppError from "../../errors/AppError";

interface Request {
    id: string | number;
    tenantId: number;
}

const DeleteAIAgentService = async ({ id, tenantId }: Request): Promise<void> => {
    const agent = await AIAgent.findOne({
        where: { id, tenantId }
    });

    if (!agent) {
        throw new AppError("ERR_NO_AI_AGENT_FOUND", 404);
    }

    await agent.destroy();
};

export default DeleteAIAgentService;
