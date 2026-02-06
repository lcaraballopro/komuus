import Setting from "../../models/Setting";

interface ListSettingsRequest {
  tenantId: number;
}

const ListSettingsService = async ({
  tenantId
}: ListSettingsRequest): Promise<Setting[] | undefined> => {
  const settings = await Setting.findAll({
    where: { tenantId }
  });

  return settings;
};

export default ListSettingsService;
