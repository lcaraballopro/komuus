import WebchatSession from "../../models/WebchatSession";
import WebchatMessage from "../../models/WebchatMessage";
import WebchatChannel from "../../models/WebchatChannel";
import AppError from "../../errors/AppError";

interface Request {
    sessionToken: string;
}

interface Response {
    session: WebchatSession;
    messages: WebchatMessage[];
    channel: WebchatChannel;
}

const GetWebchatSessionService = async ({
    sessionToken
}: Request): Promise<Response> => {
    const session = await WebchatSession.findOne({
        where: { sessionToken },
        include: [
            { model: WebchatChannel, as: "channel" }
        ]
    });

    if (!session) {
        throw new AppError("ERR_WEBCHAT_SESSION_NOT_FOUND", 404);
    }

    const messages = await WebchatMessage.findAll({
        where: { sessionId: session.id },
        order: [["createdAt", "ASC"]]
    });

    // Update last activity
    await session.update({ lastActivityAt: new Date() });

    return {
        session,
        messages,
        channel: session.channel
    };
};

export default GetWebchatSessionService;
