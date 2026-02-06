import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as PushController from "../controllers/PushController";

const pushRoutes = Router();

// Public endpoint to get VAPID public key (needed before auth for subscription)
pushRoutes.get("/vapid-public-key", PushController.vapidPublicKey);

// Protected endpoints for managing subscriptions
pushRoutes.post("/subscribe", isAuth, PushController.subscribe);
pushRoutes.post("/unsubscribe", isAuth, PushController.unsubscribe);

export default pushRoutes;
