import AIAgent from "../../models/AIAgent";

interface Request {
    name: string;
    webhookUrl: string;
    apiToken?: string;
    isActive?: boolean;
    tenantId: number;
}

const CreateAIAgentService = async ({
    name,
    webhookUrl,
    apiToken,
    isActive = true,
    tenantId
}: Request): Promise<AIAgent> => {
    const agent = await AIAgent.create({
        name,
        webhookUrl,
        apiToken,
        isActive,
        tenantId
    });

    return agent;
};

export default CreateAIAgentService;
