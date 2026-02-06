import * as Yup from "yup";
import AppError from "../../errors/AppError";
import WebchatChannel from "../../models/WebchatChannel";
import { Op } from "sequelize";

interface Request {
    id: number;
    name?: string;
    isActive?: boolean;
    primaryColor?: string;
    position?: string;
    welcomeMessage?: string;
    offlineMessage?: string;
    avatarUrl?: string;
    buttonText?: string;
    allowedDomains?: string[];
    aiAgentId?: number | null;
    queueId?: number | null;
    tenantId: number;
}

const UpdateWebchatChannelService = async ({
    id,
    name,
    isActive,
    primaryColor,
    position,
    welcomeMessage,
    offlineMessage,
    avatarUrl,
    buttonText,
    allowedDomains,
    aiAgentId,
    queueId,
    tenantId
}: Request): Promise<WebchatChannel> => {
    const channel = await WebchatChannel.findOne({
        where: { id, tenantId }
    });

    if (!channel) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_NOT_FOUND", 404);
    }

    // Validate unique name if being changed
    if (name && name !== channel.name) {
        const schema = Yup.object().shape({
            name: Yup.string()
                .required()
                .min(2)
                .test("Check-name", "This webchat channel name is already used.", async value => {
                    if (!value) return false;
                    const nameExists = await WebchatChannel.findOne({
                        where: { name: value, tenantId, id: { [Op.ne]: id } }
                    });
                    return !nameExists;
                })
        });

        try {
            await schema.validate({ name });
        } catch (err: any) {
            throw new AppError(err.message);
        }
    }

    await channel.update({
        name: name ?? channel.name,
        isActive: isActive ?? channel.isActive,
        primaryColor: primaryColor ?? channel.primaryColor,
        position: position ?? channel.position,
        welcomeMessage: welcomeMessage !== undefined ? welcomeMessage : channel.welcomeMessage,
        offlineMessage: offlineMessage !== undefined ? offlineMessage : channel.offlineMessage,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : channel.avatarUrl,
        buttonText: buttonText ?? channel.buttonText,
        allowedDomains: allowedDomains ?? channel.allowedDomains,
        aiAgentId: aiAgentId !== undefined ? aiAgentId : channel.aiAgentId,
        queueId: queueId !== undefined ? queueId : channel.queueId
    });

    return channel;
};

export default UpdateWebchatChannelService;
