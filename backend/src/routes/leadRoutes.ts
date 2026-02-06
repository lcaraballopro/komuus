/**
 * Lead API Routes
 * 
 * Endpoints for n8n/external systems to manage leads:
 * - POST /        → Create or upsert a lead
 * - GET /find     → Find lead by email/phone/sessionId
 * - GET /         → List leads with filters
 * - GET /:id      → Get lead by ID
 * - PUT /:id      → Update lead
 */

import { Router } from "express";
import isAuthApi from "../middleware/isAuthApi";
import * as LeadController from "../controllers/LeadController";

const leadRoutes = Router();

// All routes require API token authentication
leadRoutes.post("/", isAuthApi, LeadController.store);
leadRoutes.get("/find", isAuthApi, LeadController.find);
leadRoutes.get("/", isAuthApi, LeadController.index);
leadRoutes.get("/:id", isAuthApi, LeadController.show);
leadRoutes.put("/:id", isAuthApi, LeadController.update);

export default leadRoutes;
