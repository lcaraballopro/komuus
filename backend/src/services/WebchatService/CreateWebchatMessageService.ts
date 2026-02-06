import WebchatSession from "../../models/WebchatSession";
import WebchatMessage from "../../models/WebchatMessage";
import WebchatChannel from "../../models/WebchatChannel";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

interface Request {
    sessionToken: string;
    body: string;
    sender: "visitor" | "agent" | "bot";
    agentId?: number;
}

interface Response {
    message: WebchatMessage;
}

const CreateWebchatMessageService = async ({
    sessionToken,
    body,
    sender,
    agentId
}: Request): Promise<Response> => {
    const session = await WebchatSession.findOne({
        where: { sessionToken },
        include: [{ model: WebchatChannel, as: "channel" }]
    });

    if (!session) {
        throw new AppError("ERR_WEBCHAT_SESSION_NOT_FOUND", 404);
    }

    const message = await WebchatMessage.create({
        sessionId: session.id,
        body,
        sender,
        agentId: sender === "agent" ? agentId : undefined,
        isRead: sender !== "visitor"
    });

    // Update session last activity
    await session.update({ lastActivityAt: new Date() });

    // Emit to socket for real-time updates
    const io = getIO();

    if (sender === "visitor") {
        // Notify agents in the tenant room
        io.to(`tenant:${session.channel.tenantId}`)
            .emit("webchat:newMessage", {
                sessionId: session.id,
                sessionToken,
                channelId: session.channelId,
                message: {
                    id: message.id,
                    body: message.body,
                    sender: message.sender,
                    createdAt: message.createdAt
                }
            });
    } else {
        // Notify the visitor via webchat namespace
        io.of("/webchat")
            .to(`session:${sessionToken}`)
            .emit("message", {
                id: message.id,
                body: message.body,
                sender: message.sender,
                createdAt: message.createdAt
            });
    }

    return { message };
};

export default CreateWebchatMessageService;
