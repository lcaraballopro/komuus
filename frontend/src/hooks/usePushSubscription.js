import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

// Convert VAPID public key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const usePushSubscription = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkSupport = async () => {
            const supported = 'serviceWorker' in navigator && 'PushManager' in window;
            setIsSupported(supported);

            if (supported) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.getSubscription();
                    setIsSubscribed(!!subscription);
                } catch (err) {
                    console.error('[Push] Error checking subscription:', err);
                }
            }
        };

        checkSupport();
    }, []);

    const subscribe = useCallback(async () => {
        if (!isSupported) return false;

        setIsLoading(true);
        try {
            // Get VAPID public key from server
            const { data } = await api.get("/push/vapid-public-key");

            if (!data.publicKey) {
                throw new Error("VAPID public key not configured on server");
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(data.publicKey)
            });

            // Send subscription to server
            await api.post("/push/subscribe", subscription.toJSON());

            setIsSubscribed(true);
            console.log('[Push] Successfully subscribed');
            return true;
        } catch (err) {
            console.error('[Push] Subscription failed:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async () => {
        if (!isSupported) return false;

        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Notify server
                await api.post("/push/unsubscribe", { endpoint: subscription.endpoint });
                // Unsubscribe locally
                await subscription.unsubscribe();
            }

            setIsSubscribed(false);
            console.log('[Push] Successfully unsubscribed');
            return true;
        } catch (err) {
            console.error('[Push] Unsubscribe failed:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    return {
        isSubscribed,
        isSupported,
        isLoading,
        subscribe,
        unsubscribe
    };
};

export default usePushSubscription;
