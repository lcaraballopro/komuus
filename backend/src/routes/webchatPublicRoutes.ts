import { Router } from "express";
import * as WebchatPublicController from "../controllers/WebchatPublicController";

const webchatPublicRoutes = Router();

// Public routes - no authentication required
// These are used by the embedded widget

// Get channel configuration
webchatPublicRoutes.get(
    "/webchat/public/channel/:channelId",
    WebchatPublicController.getChannelConfig
);

// Create new session when visitor opens chat
webchatPublicRoutes.post(
    "/webchat/public/channel/:channelId/session",
    WebchatPublicController.createSession
);

// Get existing session with message history
webchatPublicRoutes.get(
    "/webchat/public/session/:sessionToken",
    WebchatPublicController.getSession
);

// Send message from visitor
webchatPublicRoutes.post(
    "/webchat/public/message",
    WebchatPublicController.sendMessage
);

export default webchatPublicRoutes;
