import { Request, Response } from "express";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId, profile } = req.user;

  if (!["admin", "superadmin"].includes(profile)) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const settings = await ListSettingsService({ tenantId });

  return res.status(200).json(settings);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, profile } = req.user;

  if (!["admin", "superadmin"].includes(profile)) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { settingKey: key } = req.params;
  const { value } = req.body;

  const setting = await UpdateSettingService({
    key,
    value,
    tenantId
  });

  const io = getIO();
  io.to(`tenant:${tenantId}`).emit("settings", {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};
