import { Router } from "express";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";
import whatsappRoutes from "./whatsappRoutes";
import messageRoutes from "./messageRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";
import queueRoutes from "./queueRoutes";
import quickAnswerRoutes from "./quickAnswerRoutes";
import apiRoutes from "./apiRoutes";
import n8nRoutes from "./n8nRoutes";
import aiAgentRoutes from "./aiAgentRoutes";
import companyRoutes from "./companyRoutes";
import leadRoutes from "./leadRoutes";
import roleRoutes from "./roleRoutes";
import pushRoutes from "./pushRoutes";
import contactFormRoutes from "./contactFormRoutes";
import reportRoutes from "./reportRoutes";
import webchatChannelRoutes from "./webchatChannelRoutes";
import webchatPublicRoutes from "./webchatPublicRoutes";
import closeReasonRoutes from "./closeReasonRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(quickAnswerRoutes);
routes.use("/messages", apiRoutes);
routes.use("/n8n", n8nRoutes);
routes.use("/leads", leadRoutes);
routes.use(aiAgentRoutes);
routes.use(companyRoutes);
routes.use(roleRoutes);
routes.use("/push", pushRoutes);
routes.use(contactFormRoutes);
routes.use(reportRoutes);
routes.use(webchatChannelRoutes);
routes.use(webchatPublicRoutes);
routes.use(closeReasonRoutes);

export default routes;

