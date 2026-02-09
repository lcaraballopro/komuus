import database from "../../database";

const truncate = async (): Promise<void> => {
  await database.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
  await database.truncate({ force: true, cascade: false }); // Cascade is irrelevant with checks off, but keep force
  await database.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
};

const disconnect = async (): Promise<void> => {
  return database.connectionManager.close();
};

export { truncate, disconnect };
