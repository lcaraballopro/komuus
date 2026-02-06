import { v4 as uuidv4 } from "uuid";
import WebchatSession from "../../models/WebchatSession";
import WebchatChannel from "../../models/WebchatChannel";
import AppError from "../../errors/AppError";

interface Request {
    channelId: number;
    visitorName?: string;
    visitorEmail?: string;
    visitorPhone?: string;
    ipAddress?: string;
    userAgent?: string;
    referrerUrl?: string;
}

interface Response {
    session: WebchatSession;
    channel: WebchatChannel;
}

const CreateWebchatSessionService = async ({
    channelId,
    visitorName,
    visitorEmail,
    visitorPhone,
    ipAddress,
    userAgent,
    referrerUrl
}: Request): Promise<Response> => {
    const channel = await WebchatChannel.findByPk(channelId);

    if (!channel) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_NOT_FOUND", 404);
    }

    if (!channel.isActive) {
        throw new AppError("ERR_WEBCHAT_CHANNEL_INACTIVE", 400);
    }

    const sessionToken = uuidv4();

    const session = await WebchatSession.create({
        channelId,
        sessionToken,
        visitorName,
        visitorEmail,
        visitorPhone,
        ipAddress,
        userAgent,
        referrerUrl,
        status: "active",
        lastActivityAt: new Date()
    });

    return { session, channel };
};

export default CreateWebchatSessionService;
