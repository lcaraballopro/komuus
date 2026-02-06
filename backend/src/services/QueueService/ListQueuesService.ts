import Queue from "../../models/Queue";

interface ListQueuesRequest {
  tenantId: number;
}

const ListQueuesService = async ({
  tenantId
}: ListQueuesRequest): Promise<Queue[]> => {
  const queues = await Queue.findAll({
    where: { tenantId },
    order: [["name", "ASC"]]
  });

  return queues;
};

export default ListQueuesService;
