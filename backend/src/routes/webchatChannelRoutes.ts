import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as WebchatChannelController from "../controllers/WebchatChannelController";

const webchatChannelRoutes = Router();

// All routes require authentication
webchatChannelRoutes.post("/webchat-channels", isAuth, WebchatChannelController.store);
webchatChannelRoutes.get("/webchat-channels", isAuth, WebchatChannelController.index);
webchatChannelRoutes.get("/webchat-channels/:channelId", isAuth, WebchatChannelController.show);
webchatChannelRoutes.put("/webchat-channels/:channelId", isAuth, WebchatChannelController.update);
webchatChannelRoutes.delete("/webchat-channels/:channelId", isAuth, WebchatChannelController.remove);
webchatChannelRoutes.get("/webchat-channels/:channelId/script", isAuth, WebchatChannelController.getScript);

export default webchatChannelRoutes;
