import AppError from "../../errors/AppError";
import WebchatChannel from "../../models/WebchatChannel";

interface Request {
    id: number;
    tenantId: number;
}

const DeleteWebchatChannelService = async ({
    id,
    tenantId
}: Request): Promise<void> => {
    const channel = await WebchatChannel.findOne({
        where: { id, tenantId }
    });

    if (!channel) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_NOT_FOUND", 404);
    }

    await channel.destroy();
};

export default DeleteWebchatChannelService;
