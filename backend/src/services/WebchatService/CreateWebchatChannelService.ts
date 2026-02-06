import * as Yup from "yup";
import AppError from "../../errors/AppError";
import WebchatChannel from "../../models/WebchatChannel";

interface Request {
    name: string;
    primaryColor?: string;
    position?: string;
    welcomeMessage?: string;
    offlineMessage?: string;
    avatarUrl?: string;
    buttonText?: string;
    allowedDomains?: string[];
    aiAgentId?: number;
    queueId?: number;
    tenantId: number;
}

interface Response {
    channel: WebchatChannel;
}

const CreateWebchatChannelService = async ({
    name,
    primaryColor = "#6366f1",
    position = "bottom-right",
    welcomeMessage,
    offlineMessage,
    avatarUrl,
    buttonText = "Chat",
    allowedDomains = [],
    aiAgentId,
    queueId,
    tenantId
}: Request): Promise<Response> => {
    const schema = Yup.object().shape({
        name: Yup.string()
            .required()
            .min(2)
            .test("Check-name", "This webchat channel name is already used.", async value => {
                if (!value) return false;
                const nameExists = await WebchatChannel.findOne({
                    where: { name: value, tenantId }
                });
                return !nameExists;
            })
    });

    try {
        await schema.validate({ name });
    } catch (err: any) {
        throw new AppError(err.message);
    }

    const channel = await WebchatChannel.create({
        name,
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
    });

    return { channel };
};

export default CreateWebchatChannelService;
