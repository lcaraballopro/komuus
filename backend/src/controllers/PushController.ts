import { Request, Response } from "express";
import PushSubscription from "../models/PushSubscription";
import { getVapidPublicKey } from "../services/WebPushService";

export const subscribe = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const userId = parseInt(req.user.id, 10);
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({ error: "Invalid subscription data" });
    }

    // Remove existing subscription for this endpoint (re-subscribe)
    await PushSubscription.destroy({ where: { userId, endpoint } });

    await PushSubscription.create({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
    });

    return res.status(201).json({ message: "Subscribed to push notifications" });
};

export const unsubscribe = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const userId = parseInt(req.user.id, 10);
    const { endpoint } = req.body;

    if (!endpoint) {
        return res.status(400).json({ error: "Endpoint is required" });
    }

    await PushSubscription.destroy({ where: { userId, endpoint } });

    return res.status(200).json({ message: "Unsubscribed from push notifications" });
};

export const vapidPublicKey = async (
    _req: Request,
    res: Response
): Promise<Response> => {
    const publicKey = getVapidPublicKey();

    if (!publicKey) {
        return res.status(500).json({ error: "VAPID keys not configured" });
    }

    return res.json({ publicKey });
};
