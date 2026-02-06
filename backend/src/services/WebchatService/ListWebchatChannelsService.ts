import WebchatChannel from "../../models/WebchatChannel";
import Queue from "../../models/Queue";
import AIAgent from "../../models/AIAgent";

interface Request {
    tenantId: number;
}

const ListWebchatChannelsService = async ({
    tenantId
}: Request): Promise<WebchatChannel[]> => {
    const channels = await WebchatChannel.findAll({
        where: { tenantId },
        include: [
            { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
            { model: AIAgent, as: "aiAgent", attributes: ["id", "name"] }
        ],
        order: [["name", "ASC"]]
    });

    return channels;
};

export default ListWebchatChannelsService;
