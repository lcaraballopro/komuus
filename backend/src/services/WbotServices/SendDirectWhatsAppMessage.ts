import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";

interface Request {
    whatsappId: number;
    number: string;
    message: string;
}

interface Response {
    success: boolean;
    messageId?: string;
    timestamp?: Date;
}

/**
 * Sends a WhatsApp message directly using a specific WhatsApp connection.
 * Does not require a ticket or contact record.
 */
const SendDirectWhatsAppMessage = async ({
    whatsappId,
    number,
    message
}: Request): Promise<Response> => {
    // Validate WhatsApp exists and is connected
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
        throw new AppError("ERR_WHATSAPP_NOT_FOUND", 404);
    }

    if (whatsapp.status !== "CONNECTED") {
        throw new AppError("ERR_WHATSAPP_NOT_CONNECTED", 400);
    }

    // Get the wbot session
    const wbot = getWbot(whatsappId);

    // Normalize number (remove non-digits)
    const cleanNumber = number.replace(/\D/g, "");
    const chatId = `${cleanNumber}@c.us`;

    try {
        const sentMessage = await wbot.sendMessage(chatId, message);

        return {
            success: true,
            messageId: sentMessage.id._serialized,
            timestamp: new Date()
        };
    } catch (err: any) {
        console.error("SendDirectWhatsAppMessage error:", err);
        throw new AppError("ERR_SENDING_WHATSAPP_MESSAGE", 500);
    }
};

export default SendDirectWhatsAppMessage;
