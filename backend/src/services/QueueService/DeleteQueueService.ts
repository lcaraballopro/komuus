import ShowQueueService from "./ShowQueueService";

interface DeleteQueueRequest {
  queueId: number | string;
  tenantId: number;
}

const DeleteQueueService = async ({
  queueId,
  tenantId
}: DeleteQueueRequest): Promise<void> => {
  const queue = await ShowQueueService({ queueId, tenantId });

  await queue.destroy();
};

export default DeleteQueueService;
