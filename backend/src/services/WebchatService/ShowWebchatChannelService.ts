import AppError from "../../errors/AppError";
import WebchatChannel from "../../models/WebchatChannel";
import Queue from "../../models/Queue";
import AIAgent from "../../models/AIAgent";

interface Request {
    id: number;
    tenantId: number;
}

const ShowWebchatChannelService = async ({
    id,
    tenantId
}: Request): Promise<WebchatChannel> => {
    const channel = await WebchatChannel.findOne({
        where: { id, tenantId },
        include: [
            { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
            { model: AIAgent, as: "aiAgent", attributes: ["id", "name"] }
        ]
    });

    if (!channel) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_NOT_FOUND", 404);
    }

    return channel;
};

export default ShowWebchatChannelService;
