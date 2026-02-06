import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import * as ReportController from "../controllers/ReportController";

const reportRoutes = Router();

// All report routes require authentication and admin role
reportRoutes.get("/reports/tickets/stats", isAuth, isAdmin, ReportController.ticketStats);
reportRoutes.get("/reports/agents/performance", isAuth, isAdmin, ReportController.agentPerformance);
reportRoutes.get("/reports/queues/stats", isAuth, isAdmin, ReportController.queueStats);
reportRoutes.get("/reports/daily", isAuth, isAdmin, ReportController.dailyStats);
reportRoutes.get("/reports/contacts/stats", isAuth, isAdmin, ReportController.contactStats);
reportRoutes.get("/reports/dashboard", isAuth, isAdmin, ReportController.dashboardStats);
reportRoutes.get("/reports/tickets/detailed", isAuth, isAdmin, ReportController.detailedTickets);

export default reportRoutes;
