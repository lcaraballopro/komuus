import webpush from "web-push";
import PushSubscription from "../models/PushSubscription";
import { logger } from "../utils/logger";

// VAPID keys from environment
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        "mailto:admin@komu.us",
        vapidPublicKey,
        vapidPrivateKey
    );
}

interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    ticketId: number;
}

export const sendPushToUser = async (
    userId: number,
    payload: PushPayload
): Promise<void> => {
    if (!vapidPublicKey || !vapidPrivateKey) {
        logger.warn("VAPID keys not configured, skipping push notification");
        return;
    }

    const subscriptions = await PushSubscription.findAll({ where: { userId } });

    if (subscriptions.length === 0) {
        return;
    }

    const pushPromises = subscriptions.map(async sub => {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                },
                JSON.stringify(payload)
            );
            logger.info(`Push sent to user ${userId} via subscription ${sub.id}`);
        } catch (err: any) {
            // Remove invalid subscriptions (410 Gone = unsubscribed, 404 = not found)
            if (err.statusCode === 410 || err.statusCode === 404) {
                logger.info(`Removing invalid subscription ${sub.id}`);
                await sub.destroy();
            } else {
                logger.error(`Push failed for subscription ${sub.id}: ${err.message}`);
            }
        }
    });

    await Promise.all(pushPromises);
};

export const getVapidPublicKey = (): string | undefined => {
    return vapidPublicKey;
};
