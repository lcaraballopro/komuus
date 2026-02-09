/**
 * WebchatN8nReplyService - Handles reply messages from n8n for webchat sessions
 *
 * Receives a sessionToken + message from n8n and delivers it to the visitor
 * via the existing CreateWebchatMessageService (which handles socket emission).
 */

import WebchatSession from "../../models/WebchatSession";
import CreateWebchatMessageService from "../WebchatService/CreateWebchatMessageService";
import { logger } from "../../utils/logger";

interface WebchatReplyRequest {
    sessionToken: string;
    message: string;
}

interface WebchatReplyResponse {
    success: boolean;
    sessionId?: number;
    error?: string;
}

/**
 * Send a reply from n8n to a webchat visitor
 */
const handleWebchatN8nReply = async (
    request: WebchatReplyRequest
): Promise<WebchatReplyResponse> => {
    const { sessionToken, message } = request;

    if (!sessionToken || !message) {
        return {
            success: false,
            error: "sessionToken and message are required"
        };
    }

    try {
        // Verify session exists
        const session = await WebchatSession.findOne({
            where: { sessionToken, status: "active" }
        });

        if (!session) {
            return {
                success: false,
                error: `No active webchat session found for token: ${sessionToken}`
            };
        }

        // Use existing service to create the message and emit socket events
        await CreateWebchatMessageService({
            sessionToken,
            body: message,
            sender: "bot"
        });

        logger.info(
            `n8n webchat reply sent to session ${sessionToken} (session ${session.id})`
        );

        return {
            success: true,
            sessionId: session.id
        };
    } catch (error: any) {
        logger.error(
            `n8n webchat reply error for ${sessionToken}: ${error.message}`
        );
        return {
            success: false,
            error: error.message || "Failed to send webchat reply"
        };
    }
};

export { handleWebchatN8nReply, WebchatReplyRequest, WebchatReplyResponse };
