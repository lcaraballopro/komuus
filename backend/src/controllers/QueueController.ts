import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateQueueService from "../services/QueueService/CreateQueueService";
import DeleteQueueService from "../services/QueueService/DeleteQueueService";
import ListQueuesService from "../services/QueueService/ListQueuesService";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import UpdateQueueService from "../services/QueueService/UpdateQueueService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const queues = await ListQueuesService({ tenantId });

  return res.status(200).json(queues);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { name, color, greetingMessage } = req.body;

  const queue = await CreateQueueService({ name, color, greetingMessage, tenantId });

  const io = getIO();
  io.to(`tenant:${tenantId}`).emit("queue", {
    action: "update",
    queue
  });

  return res.status(200).json(queue);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { queueId } = req.params;

  const queue = await ShowQueueService({ queueId, tenantId });

  return res.status(200).json(queue);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { queueId } = req.params;

  const queue = await UpdateQueueService({
    queueId,
    queueData: req.body,
    tenantId
  });

  const io = getIO();
  io.to(`tenant:${tenantId}`).emit("queue", {
    action: "update",
    queue
  });

  return res.status(201).json(queue);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { queueId } = req.params;

  await DeleteQueueService({ queueId, tenantId });

  const io = getIO();
  io.to(`tenant:${tenantId}`).emit("queue", {
    action: "delete",
    queueId: +queueId
  });

  return res.status(200).send();
};
