import express from "express";
import isAuth from "../middleware/isAuth";

import * as AIAgentController from "../controllers/AIAgentController";

const aiAgentRoutes = express.Router();

aiAgentRoutes.get("/ai-agents", isAuth, AIAgentController.index);
aiAgentRoutes.post("/ai-agents", isAuth, AIAgentController.store);
aiAgentRoutes.get("/ai-agents/:agentId", isAuth, AIAgentController.show);
aiAgentRoutes.put("/ai-agents/:agentId", isAuth, AIAgentController.update);
aiAgentRoutes.delete("/ai-agents/:agentId", isAuth, AIAgentController.remove);

export default aiAgentRoutes;
