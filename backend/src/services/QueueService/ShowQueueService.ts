import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

interface ShowQueueRequest {
  queueId: number | string;
  tenantId: number;
}

const ShowQueueService = async ({
  queueId,
  tenantId
}: ShowQueueRequest): Promise<Queue> => {
  const queue = await Queue.findOne({
    where: { id: queueId, tenantId }
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return queue;
};

export default ShowQueueService;
