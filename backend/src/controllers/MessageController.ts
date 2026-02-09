import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import CreateWebchatMessageService from "../services/WebchatService/CreateWebchatMessageService";
import WebchatSession from "../models/WebchatSession";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;
  const { tenantId } = req.user;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId,
    tenantId
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const { tenantId } = req.user;

  const ticket = await ShowTicketService({ id: ticketId, tenantId });

  SetTicketMessagesAsRead(ticket);

  // Route through webchat service if this is a webchat ticket
  if (ticket.channel === "webchat") {
    const session = await WebchatSession.findOne({
      where: { ticketId: ticket.id }
    });

    if (session) {
      const messageBody = body || (medias && medias.length > 0 ? "[Archivo adjunto]" : "");
      await CreateWebchatMessageService({
        sessionToken: session.sessionToken,
        body: messageBody,
        sender: "agent",
        agentId: Number(req.user.id)
      });
    }

    return res.send();
  }

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket, quotedMsg });
  }

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  const ticket = message.ticket;
  io.to(`tenant:${ticket.tenantId}`).emit("appMessage", {
    action: "update",
    message
  });

  return res.send();
};
