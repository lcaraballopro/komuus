/**
 * BotStateService - Manages bot active/inactive state per chat
 * 
 * Uses in-memory cache with optional Redis for persistence.
 * chatId format: "573001234567@c.us" or just "573001234567"
 */

import { logger } from "../../utils/logger";

interface BotState {
    isBotActive: boolean;
    updatedAt: Date;
    metadata?: Record<string, any>;
}

// In-memory cache for bot states
const botStateCache = new Map<string, BotState>();

// Default state for new chats - bot is active by default
const DEFAULT_BOT_STATE: BotState = {
    isBotActive: true,
    updatedAt: new Date()
};

/**
 * Normalize chatId to a consistent format (without @c.us suffix)
 */
const normalizeChatId = (chatId: string): string => {
    return chatId.replace(/@[cs]\.us$/, "").replace(/\D/g, "");
};

/**
 * Get the current bot state for a chat
 */
const getBotState = async (chatId: string): Promise<BotState> => {
    const normalizedId = normalizeChatId(chatId);

    const state = botStateCache.get(normalizedId);

    if (state) {
        return state;
    }

    // Return default state (bot active) for new chats
    return { ...DEFAULT_BOT_STATE, updatedAt: new Date() };
};

/**
 * Check if bot is active for a chat
 */
const isBotActive = async (chatId: string): Promise<boolean> => {
    const state = await getBotState(chatId);
    return state.isBotActive;
};

/**
 * Set bot active/inactive for a chat
 */
const setBotActive = async (
    chatId: string,
    active: boolean,
    metadata?: Record<string, any>
): Promise<void> => {
    const normalizedId = normalizeChatId(chatId);

    const newState: BotState = {
        isBotActive: active,
        updatedAt: new Date(),
        metadata
    };

    botStateCache.set(normalizedId, newState);

    logger.info(`BotState: ${normalizedId} set to ${active ? "active" : "inactive"}`);
};

/**
 * Activate bot for a chat
 */
const activateBot = async (chatId: string): Promise<void> => {
    await setBotActive(chatId, true);
};

/**
 * Deactivate bot for a chat (escalate to human)
 */
const deactivateBot = async (
    chatId: string,
    reason?: string
): Promise<void> => {
    await setBotActive(chatId, false, { escalationReason: reason });
};

/**
 * Reset bot state for a chat (remove from cache)
 */
const resetBotState = async (chatId: string): Promise<void> => {
    const normalizedId = normalizeChatId(chatId);
    botStateCache.delete(normalizedId);
    logger.info(`BotState: ${normalizedId} reset to default`);
};

/**
 * Get all active bot states (for debugging/monitoring)
 */
const getAllBotStates = (): Map<string, BotState> => {
    return new Map(botStateCache);
};

/**
 * Clear all bot states (for testing/reset)
 */
const clearAllBotStates = (): void => {
    botStateCache.clear();
    logger.info("BotState: All states cleared");
};

export {
    getBotState,
    isBotActive,
    setBotActive,
    activateBot,
    deactivateBot,
    resetBotState,
    getAllBotStates,
    clearAllBotStates,
    normalizeChatId,
    BotState
};
