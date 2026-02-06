/**
 * n8n API Routes
 * 
 * Endpoints for n8n to interact with Komu:
 * - POST /send-message - Send WhatsApp message directly
 * - GET /whatsapps - List available WhatsApp connections
 * - POST /reply - Send message to customer
 * - POST /escalate - Transfer to human queue
 * - POST /reactivate - Reactivate bot for chat
 * - GET /bot-state/:chatId - Get bot state
 * - PUT /bot-state/:chatId - Set bot state
 * - GET /status - Integration status
 * - GET /health - Health check
 */

import { Router } from "express";
import isAuthApi from "../middleware/isAuthApi";
import * as N8nController from "../controllers/N8nController";

const n8nRoutes = Router();

// Health check (no auth required)
n8nRoutes.get("/health", N8nController.health);

// WhatsApp direct messaging
n8nRoutes.post("/send-message", isAuthApi, N8nController.sendMessage);
n8nRoutes.get("/whatsapps", isAuthApi, N8nController.listWhatsapps);

// All other routes require API authentication
n8nRoutes.post("/reply", isAuthApi, N8nController.reply);
n8nRoutes.post("/escalate", isAuthApi, N8nController.escalate);
n8nRoutes.post("/reactivate", isAuthApi, N8nController.reactivate);

n8nRoutes.get("/bot-state/:chatId", isAuthApi, N8nController.getBotStateHandler);
n8nRoutes.put("/bot-state/:chatId", isAuthApi, N8nController.setBotStateHandler);

n8nRoutes.get("/status", isAuthApi, N8nController.status);

export default n8nRoutes;
